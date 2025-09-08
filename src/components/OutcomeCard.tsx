'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ORIGINALS_SUBMISSION_URL } from '@/lib/links';

interface OutcomeCardProps {
  track: 'original' | 'rfd';
  message: string;
  nextUrl?: string;
  onStartOver: () => void;
  submissionData: {
    submissionType?: string;
    rights?: string;
    territories?: string;
  };
}

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  availability: string;
  platformNotes: string;
}

export default function OutcomeCard({ track, message, nextUrl, onStartOver, submissionData }: OutcomeCardProps) {
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    availability: '',
    platformNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setEmailError('');
    
    // Validate required fields
    if (!contactForm.name.trim()) {
      return;
    }
    
    if (!contactForm.email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(contactForm.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call - log to console for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fullSubmission = {
        ...submissionData,
        ...contactForm
      };
      
      console.log('RFD Contact form submitted:', fullSubmission);
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear email error when user types
    if (field === 'email' && emailError) {
      setEmailError('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 mb-4">
            {track === 'rfd' ? 'Looks like Redistribution (RFD)' : 'Looks like a Tubi Original submission'}
          </h3>
        </div>

        {/* Message */}
        <p className="font-body text-lg text-gray-700 text-center mb-8 leading-relaxed">
          {message}
        </p>

        {/* Original Track - CTA Button */}
        {track === 'original' && (
          <div className="text-center mb-8">
            <a
              href={nextUrl || ORIGINALS_SUBMISSION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-[#FFFF13] text-[#0B0019] font-heading font-bold text-lg rounded-full hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C00E5] transition-opacity shadow-lg"
            >
              Complete Official Submission
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            
            {/* Helper text */}
            <p className="mt-2 text-sm text-[#0B0019]/70">
              Opens in a new tab. You can return here anytime.
            </p>
            
            {/* Helper text for finished content without rights */}
            {submissionData.submissionType === 'finished' && submissionData.rights === 'no_unsure' && (
              <p className="mt-4 font-body text-sm text-gray-600 max-w-md mx-auto">
                If the rights are controlled by someone else, ask the rightsholder to submit the redistribution request.
              </p>
            )}
          </div>
        )}

        {/* RFD Track - Availability Follow-up and Contact Form */}
        {track === 'rfd' && !isSubmitted && (
          <div className="mb-8">
            {/* Availability Follow-up */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-heading font-bold text-lg text-gray-900 mb-4">
                Availability
              </h4>
              <p className="font-body text-sm text-gray-700 mb-3">
                Where is it currently available?
              </p>
              <div className="space-y-2">
                {[
                  { label: 'Not available anywhere yet', value: 'none' },
                  { label: 'Festivals / private screener only', value: 'festivals' },
                  { label: 'Already on other platforms (AVOD/SVOD/TVOD)', value: 'other_platforms' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange('availability', option.value)}
                    aria-pressed={contactForm.availability === option.value}
                    className={`
                      w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200
                      font-body text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFF13]
                      hover:translate-y-[-1px] hover:shadow-sm
                      ${contactForm.availability === option.value
                        ? 'bg-[#FFFF13] border-[#FFFF13] text-[#0B0019] font-medium'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-[#8C00E5]'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              {/* Platform Notes Field */}
              {contactForm.availability === 'other_platforms' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3"
                >
                  <input
                    id="platformNotes"
                    type="text"
                    value={contactForm.platformNotes}
                    onChange={(e) => handleInputChange('platformNotes', e.target.value)}
                    placeholder="Which platforms?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-body text-sm focus:border-[#8C00E5] focus:outline-none transition-colors"
                  />
                </motion.div>
              )}
            </div>
            
            {/* Contact Form */}
            <h4 className="font-heading font-bold text-lg text-gray-900 mb-4">
              Contact Information
            </h4>
          </div>
        )}
        
        {track === 'rfd' && !isSubmitted && (
          <form onSubmit={handleContactSubmit} className="space-y-4 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name Field */}
              <div>
                <label htmlFor="contact-name" className="block font-body text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-body text-sm focus:border-[#8C00E5] focus:outline-none transition-colors"
                  placeholder="Your full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="contact-email" className="block font-body text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg font-body text-sm focus:outline-none transition-colors ${
                    emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#8C00E5]'
                  }`}
                  placeholder="your.email@company.com"
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600 font-body">{emailError}</p>
                )}
              </div>
            </div>

            {/* Company Field */}
            <div>
              <label htmlFor="contact-company" className="block font-body text-sm font-medium text-gray-700 mb-1">
                Company <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="contact-company"
                type="text"
                value={contactForm.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-body text-sm focus:border-[#8C00E5] focus:outline-none transition-colors"
                placeholder="Your company or organization"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !contactForm.name.trim() || !contactForm.email.trim() || !contactForm.availability}
                className={`
                  inline-flex items-center px-6 py-3 rounded-full font-body font-medium transition-all duration-200
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C00E5]
                  ${isSubmitting || !contactForm.name.trim() || !contactForm.email.trim() || !contactForm.availability
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#8C00E5] text-white hover:bg-[#7A00CC] shadow-lg'
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Connect with our team'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Success State for Contact Form */}
        {track === 'rfd' && isSubmitted && (
          <div className="text-center mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="font-heading font-bold text-lg text-green-800 mb-2">
              Thank you!
            </h4>
            <p className="font-body text-green-700">
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              We've received your information and will be in touch within 2-3 business days.
            </p>
          </div>
        )}

        {/* Start Over Button */}
        <div className="text-center pt-4 border-t border-gray-200">
          <button
            onClick={onStartOver}
            className="font-body text-[#8C00E5] hover:text-[#7A00CC] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C00E5] transition-colors"
          >
            ← Start over with a new submission
          </button>
        </div>
      </div>
    </motion.div>
  );
}
