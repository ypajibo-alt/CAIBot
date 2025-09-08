'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TriageAnswers {
  submissionType?: string;
  rights?: string;
  territories?: string;
  availability?: string;
  platformNotes?: string;
}

interface TriageWizardProps {
  onComplete: (answers: TriageAnswers) => void;
  isLoading?: boolean;
}

interface Question {
  id: keyof TriageAnswers;
  label: string;
  options: Array<{ label: string; value: string }>;
  hasTextField?: boolean;
  textFieldLabel?: string;
  textFieldKey?: keyof TriageAnswers;
  showTextFieldWhen?: string;
}

const questions: Question[] = [
  {
    id: 'submissionType',
    label: 'What are you submitting?',
    options: [
      { label: 'Finished film/series (ready to stream)', value: 'finished' },
      { label: 'Work-in-progress / rough cut', value: 'wip' },
      { label: 'Idea / pitch / treatment', value: 'idea' },
      { label: 'Trailer/teaser only', value: 'trailer' }
    ]
  },
  {
    id: 'rights',
    label: 'Do you own the distribution rights?',
    options: [
      { label: 'Yes — worldwide', value: 'yes_world' },
      { label: 'Yes — limited territories', value: 'yes_limited' },
      { label: 'No / not sure', value: 'no_unsure' }
    ],
    hasTextField: true,
    textFieldLabel: 'Please specify territories',
    textFieldKey: 'territories',
    showTextFieldWhen: 'yes_limited'
  }
];

export default function TriageWizard({ onComplete, isLoading = false }: TriageWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<TriageAnswers>({});
  const [direction, setDirection] = useState(1);
  const [showOutcome, setShowOutcome] = useState(false);
  const [classification, setClassification] = useState<'original' | 'rfd' | null>(null);
  const [rfdSubmitted, setRfdSubmitted] = useState(false);
  
  // RFD Form state
  const [rfdForm, setRfdForm] = useState({
    name: '',
    email: '',
    synopsis: '',
    screenerUrl: ''
  });
  const [rfdFormErrors, setRfdFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingRfd, setIsSubmittingRfd] = useState(false);

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const canGoNext = answers[currentQuestion.id] !== undefined;
  const canGoBack = currentStep > 0;

  const handleNext = useCallback(() => {
    if (canGoNext && !isLastStep) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  }, [canGoNext, isLastStep]);

  const handleBack = useCallback(() => {
    if (canGoBack) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  }, [canGoBack]);

  const handleComplete = useCallback(() => {
    if (canGoNext) {
      onComplete(answers);
    }
  }, [canGoNext, answers, onComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canGoBack) {
        handleBack();
      } else if (e.key === 'ArrowRight' && canGoNext) {
        if (isLastStep) {
          handleComplete();
        } else {
          handleNext();
        }
      } else if (e.key === 'Enter' && canGoNext) {
        if (isLastStep) {
          handleComplete();
        } else {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, canGoNext, canGoBack, isLastStep, handleBack, handleComplete, handleNext]);

  const handleAnswerSelect = (value: string) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: value
    };
    
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentStep === questions.length - 1) {
        // Determine classification
        const isRfd = newAnswers.submissionType === 'finished' && 
                     (newAnswers.rights === 'yes_world' || newAnswers.rights === 'yes_limited');
        
        if (isRfd) {
          setClassification('rfd');
          setShowOutcome(true);
        } else {
          setClassification('original');
        onComplete(newAnswers);
        }
      } else {
        setDirection(1);
        setCurrentStep(prev => prev + 1);
      }
    }, 150);
  };

  const handleTextFieldChange = (value: string) => {
    if (currentQuestion.textFieldKey) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.textFieldKey!]: value
      }));
    }
  };

  // RFD Form validation and submission
  const validateRfdForm = () => {
    const errors: Record<string, string> = {};
    
    if (!rfdForm.name.trim()) {
      errors.name = 'Full name is required';
    }
    
    if (!rfdForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rfdForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!rfdForm.synopsis.trim()) {
      errors.synopsis = 'Synopsis is required';
    } else if (rfdForm.synopsis.trim().length < 40) {
      errors.synopsis = 'Synopsis must be at least 40 characters';
    } else if (rfdForm.synopsis.trim().length > 1000) {
      errors.synopsis = 'Synopsis must be no more than 1000 characters';
    }
    
    if (!rfdForm.screenerUrl.trim()) {
      errors.screenerUrl = 'Screener link is required';
    } else {
      try {
        new URL(rfdForm.screenerUrl);
      } catch {
        errors.screenerUrl = 'Please enter a valid URL';
      }
    }
    
    setRfdFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRfdFormChange = (field: keyof typeof rfdForm, value: string) => {
    setRfdForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (rfdFormErrors[field]) {
      setRfdFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRfdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRfdForm()) return;
    
    setIsSubmittingRfd(true);
    
    try {
      // Submit to RFD intake API
      const fullSubmission = {
        ...answers,
        ...rfdForm,
        classification: 'rfd'
      };
      
      const response = await fetch('/api/rfd-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullSubmission),
      });
      
      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(result.error || 'Submission failed');
      }
      
      console.log('RFD Form submitted successfully:', fullSubmission);
      
      // Show thank you screen after successful submission
      setRfdSubmitted(true);
      
    } catch (error) {
      console.error('RFD submission error:', error);
      // TODO: Show error state to user
    } finally {
      setIsSubmittingRfd(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const showTextField = currentQuestion.hasTextField && 
    currentQuestion.showTextFieldWhen && 
    answers[currentQuestion.id] === currentQuestion.showTextFieldWhen;

  // Show RFD thank you screen after successful submission
  if (showOutcome && classification === 'rfd' && rfdSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 mb-4">
            Thank you for your RFD submission!
          </h3>
          
          <p className="font-body text-lg text-gray-700 mb-6 leading-relaxed">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            We've received your redistribution application and will review it carefully. Our team will be in touch within 2-3 business days.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="font-body text-sm text-gray-600">
              <strong>What happens next:</strong><br/>
              • Our content team will review your submission<br/>
              • We&apos;ll evaluate the screener and synopsis<br/>
              • You&apos;ll hear back from us via email with next steps
            </p>
          </div>
          
          <p className="font-body text-sm text-gray-500">
            Submission ID: RFD-{Date.now().toString().slice(-6)}
          </p>
        </div>
      </motion.div>
    );
  }

  // Show RFD form if classification is RFD
  if (showOutcome && classification === 'rfd' && !rfdSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
          <h3 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 mb-4 text-center">
            Looks like Redistribution (RFD)
          </h3>
          <p className="font-body text-gray-700 text-center mb-8">
            Please provide the following information to complete your submission:
          </p>

          <form onSubmit={handleRfdSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="rfd_name" className="block font-body text-sm font-medium text-gray-700 mb-2">
                Full name *
              </label>
              <input
                id="rfd_name"
                type="text"
                value={rfdForm.name}
                onChange={(e) => handleRfdFormChange('name', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg font-body text-base transition-colors focus:outline-none ${
                  rfdFormErrors.name 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-[#8C00E5]'
                }`}
                placeholder="Enter your full name"
              />
              {rfdFormErrors.name && (
                <p className="mt-1 text-sm text-red-600 font-body">{rfdFormErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="rfd_email" className="block font-body text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="rfd_email"
                type="email"
                value={rfdForm.email}
                onChange={(e) => handleRfdFormChange('email', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg font-body text-base transition-colors focus:outline-none ${
                  rfdFormErrors.email 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-[#8C00E5]'
                }`}
                placeholder="Enter your email address"
              />
              {rfdFormErrors.email && (
                <p className="mt-1 text-sm text-red-600 font-body">{rfdFormErrors.email}</p>
              )}
            </div>

            {/* Synopsis */}
            <div>
              <label htmlFor="rfd_synopsis" className="block font-body text-sm font-medium text-gray-700 mb-2">
                Synopsis * <span className="text-gray-500">(40-1000 characters)</span>
              </label>
              <textarea
                id="rfd_synopsis"
                value={rfdForm.synopsis}
                onChange={(e) => handleRfdFormChange('synopsis', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-lg font-body text-base transition-colors focus:outline-none resize-vertical ${
                  rfdFormErrors.synopsis 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-[#8C00E5]'
                }`}
                placeholder="Provide a brief synopsis of your content..."
              />
              <div className="flex justify-between items-center mt-1">
                {rfdFormErrors.synopsis ? (
                  <p className="text-sm text-red-600 font-body">{rfdFormErrors.synopsis}</p>
                ) : (
                  <p className="text-sm text-gray-500 font-body">
                    {rfdForm.synopsis.length}/1000 characters
                  </p>
                )}
              </div>
            </div>

            {/* Screener URL */}
            <div>
              <label htmlFor="rfd_screenerUrl" className="block font-body text-sm font-medium text-gray-700 mb-2">
                Screener link (URL) — file upload coming soon *
              </label>
              <input
                id="rfd_screenerUrl"
                type="url"
                value={rfdForm.screenerUrl}
                onChange={(e) => handleRfdFormChange('screenerUrl', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg font-body text-base transition-colors focus:outline-none ${
                  rfdFormErrors.screenerUrl 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-[#8C00E5]'
                }`}
                placeholder="https://example.com/screener-link"
              />
              {rfdFormErrors.screenerUrl && (
                <p className="mt-1 text-sm text-red-600 font-body">{rfdFormErrors.screenerUrl}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmittingRfd}
                className={`w-full inline-flex justify-center items-center px-6 py-4 rounded-full font-heading font-bold text-lg transition-all duration-200 ${
                  isSubmittingRfd
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#FFFF13] text-[#0B0019] hover:opacity-90 shadow-lg'
                }`}
              >
                {isSubmittingRfd ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit RFD Application'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="font-body text-sm text-gray-600">
            Step {currentStep + 1} of {questions.length}
          </span>
          <span className="font-body text-sm text-gray-600">
            {Math.round(((currentStep + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-[#8C00E5] to-[#45009D] h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Question Container */}
      <div className="relative min-h-[400px] mb-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0"
          >
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            >
              {/* Question Label */}
              <div className="py-6">
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 leading-tight">
                  {currentQuestion.label}
                </h3>
              </div>

              {/* Answer Options */}
              <div className="space-y-3 gap-3">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut', delay: 0.2 + (index * 0.05) }}
                    onClick={() => handleAnswerSelect(option.value)}
                    aria-pressed={answers[currentQuestion.id] === option.value}
                    className={`
                      w-full text-left px-6 py-4 rounded-full border-2 transition-all duration-200
                      font-body text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFF13]
                      hover:translate-y-[-1px] hover:shadow-md
                      ${answers[currentQuestion.id] === option.value
                        ? 'bg-[#FFFF13] border-[#FFFF13] text-[#0B0019] font-medium shadow-lg'
                        : 'bg-white border-[#8C00E5] text-[#8C00E5] hover:bg-[#8C00E5]/5'
                      }
                    `}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>

              {/* Conditional Text Field */}
              <AnimatePresence>
                {showTextField && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: 12 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="overflow-hidden py-6"
                  >
                    <div className="max-w-prose">
                      <label 
                        htmlFor="territories"
                        className="block font-body text-sm font-medium text-gray-700 mb-2"
                      >
                        {currentQuestion.textFieldLabel}
                      </label>
                      <input
                        id="territories"
                        type="text"
                        value={answers[currentQuestion.textFieldKey!] || ''}
                        onChange={(e) => handleTextFieldChange(e.target.value)}
                        placeholder="e.g., North America, Europe, Asia-Pacific"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-body text-base focus:border-[#8C00E5] focus:outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFF13]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <motion.div 
        className="flex items-center justify-between py-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
      >
        <button
          onClick={handleBack}
          disabled={!canGoBack}
          className={`
            px-6 py-3 rounded-full font-body font-medium transition-all duration-200
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFF13]
            hover:translate-y-[-1px] hover:shadow-md
            ${canGoBack
              ? 'text-[#8C00E5] border-2 border-[#8C00E5] hover:bg-[#8C00E5]/5'
              : 'text-gray-400 border-2 border-gray-300 cursor-not-allowed'
            }
          `}
          aria-label="Go to previous question"
        >
          ← Back
        </button>

        <div className="flex items-center gap-3">
          {questions.map((_, index) => (
            <motion.div
              key={index}
              className={`
                w-2 h-2 rounded-full transition-all duration-200
                ${index <= currentStep ? 'bg-[#8C00E5]' : 'bg-gray-300'}
              `}
              initial={{ scale: 0.8 }}
              animate={{ scale: index === currentStep ? 1.2 : 1 }}
              transition={{ duration: 0.2 }}
              aria-current={index === currentStep ? 'step' : undefined}
            />
          ))}
        </div>

        {/* Show loading state when processing final step */}
        {isLoading && isLastStep ? (
          <div className="px-6 py-3 rounded-full bg-[#FFFF13] text-[#0B0019] font-body font-medium inline-flex items-center shadow-lg">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0B0019]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        ) : (
          <div className="px-6 py-3 text-transparent">
            {/* Invisible placeholder to maintain layout */}
            Next →
          </div>
        )}
      </motion.div>

      {/* Keyboard Hints */}
      <motion.div 
        className="mt-6 text-center max-w-prose mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <p className="font-body text-xs text-gray-500">
          Click an answer to continue • Use ← → arrow keys to navigate • Enter to advance
        </p>
      </motion.div>
    </div>
  );
}