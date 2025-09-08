'use client';

import ValuesRow from '@/components/ValuesRow';
import SubmissionFlow from '@/components/SubmissionFlow';

export default function Home() {





            const faqData = [
            {
              title: "What's the response timeline?",
                body: "Due to high volume, we aren't able to reply to every submission or provide individual feedback. If your project is a fit or we need more details, we'll reach out by email.",
              imgSrc: "/images/TubiValues_Icon_DeliverDelight.png",
              imgAlt: "Timeline icon"
            },
    {
      title: "Can I check status or follow up?",
      body: "We don't provide individual status updates and can't respond to follow-up emails. Please do not resend your materials to any individual Tubi team member; if you do resend your materials your project will be removed from further consideration.",
      imgSrc: "/images/TubiValues_Icon_OwnIt.png",
      imgAlt: "Policy icon"
    },
    {
      title: "Can I submit multiple titles?",
      body: "Please submit one form per title. For a series, submit once for the series and include season details in the notes. Avoid duplicate submissions of the same title unless there's a material change.",
      imgSrc: "/images/TubiValues_Icon_StayNimble.png",
      imgAlt: "Multiple titles icon"
    }
  ];

  return (

<div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative pt-24 sm:pt-32 pb-20 px-4 overflow-hidden"
                      style={{
                background: 'linear-gradient(180deg, #8C00E5 0%, #45009D 100%)'
              }}
      >
        {/* Logo */}
        <div className="absolute left-6 top-6 z-20">
          <a href="#" aria-label="Tubi home"
             className="inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFF13]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/tubi-logo-yellow.svg" alt="Tubi" className="h-5 w-auto" />
          </a>
        </div>
        {/* Radial overlay for depth */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at bottom left, rgba(0,0,0,0.3) 0%, transparent 50%)'
          }}
        />
        
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-heading font-black tracking-[-0.02em] leading-[0.85] uppercase text-5xl sm:text-6xl md:text-7xl mb-6" style={{ color: '#FFFF13', fontFamily: 'Tubi Sans Variable, Poppins, sans-serif' }}>
              Submit your project to Tubi!
            </h1>
            <p className="font-body text-white leading-snug max-w-2xl mx-auto mt-2 mb-4 text-xl">
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              Start below and we'll direct you to our Tubi Originals Portal or Request for Distribution Form. Due to volume, we may not be able to reply to every submission.
            </p>
          </div>
        </div>
      </section>

      {/* Choose Section */}
      <section id="choose" className="bg-white py-16">
        <SubmissionFlow />
      </section>





      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-black/0 via-black/10 to-black/0" />

      {/* FAQ Section */}
      <section id="faq" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-heading font-black tracking-[-0.01em] text-3xl sm:text-4xl text-gray-900 text-center mb-6" style={{ fontFamily: 'Tubi Sans Variable, Poppins, sans-serif' }}>
            Frequently Asked Questions
          </h2>
          <ValuesRow items={faqData} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-white border-t border-gray-200">
        <div className="container mx-auto">
          <div className="text-center">
            <p className="text-sm font-body text-tubi-gray">
              © {new Date().getFullYear()} — Demo submission triage. By continuing you agree to a short privacy notice. This tool stores your answers only to help route your submission.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

