'use client';

import { useState, useMemo } from "react";
import clsx from "clsx";
import { ORIGINALS_SUBMISSION_URL } from '@/lib/links';

export default function SubmissionFlow() {
  const [showRfdForm, setShowRfdForm] = useState(false);
  const [rfdSubmitted, setRfdSubmitted] = useState(false);

  // --- RFD form state ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [logline, setLogline] = useState("");
  const [link, setLink] = useState("");

  const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email), [email]);
  const urlOk = useMemo(() => /^(https?:\/\/)/i.test(link), [link]);
  const ready = name.trim() && emailOk && logline.trim() && urlOk;

  const resetForm = () => {
    setName("");
    setEmail("");
    setLogline("");
    setLink("");
  };



  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* PAGE-LEVEL HEADER (swaps label only) */}
      <h2 className="font-heading font-black tracking-[-0.01em] text-3xl sm:text-4xl text-gray-900 text-center mb-6 focus:outline-none focus:ring-0" style={{ fontFamily: 'Tubi Sans Variable, Poppins, sans-serif' }}>
        {showRfdForm ? "Request for Distribution" : "Choose Your Path"}
      </h2>

      {/* VIEW: RFD FORM */}
      {showRfdForm ? (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-8">
          {rfdSubmitted ? (
            <div className="max-w-xl mx-auto">
              <div className="rounded-2xl bg-white shadow-md border border-gray-100 p-8 text-center">
                {/* success icon */}
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600">
                    <path fill="currentColor" d="M9.55 17.54 4.8 12.8l1.4-1.4 3.35 3.34 7.24-7.24 1.41 1.41-8.65 8.63z"/>
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-neutral-900">Thank you!</h3>

                <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-neutral-700">
                  <p>Thank you so much for thinking of Tubi. We&apos;ve received your materials.</p>
                  <p><strong>Please do not resend your materials to any individual Tubi team member.</strong> If you do, your project will be removed from further consideration.</p>
                  <p>Due to the volume of requests, we&apos;re not able to respond to each submission individually.</p>
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      setShowRfdForm(false);
                      setRfdSubmitted(false);
                      resetForm();
                    }}
                    className="inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold
                               text-neutral-900 bg-neutral-100 hover:bg-neutral-200
                               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form
              className="grid gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!ready) return;
                
                try {
                  const response = await fetch('/api/rfd-intake', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      name,
                      email,
                      logline,
                      link,
                    }),
                  });

                  const result = await response.json();
                  
                  if (result.ok) {
                    setRfdSubmitted(true);
                    resetForm();
                  } else {
                    console.error('Submission failed:', result.error);
                    // Still show success to user even if email fails
                    setRfdSubmitted(true);
                    resetForm();
                  }
                } catch (error) {
                  console.error('Submission error:', error);
                  // Still show success to user even if there's an error
                  setRfdSubmitted(true);
                  resetForm();
                }
              }}
            >
            <label className="block">
              <span className="text-sm font-medium text-neutral-800">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-800">Best email to contact</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={clsx(
                  "mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2",
                  email && !emailOk
                    ? "border-red-400 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-600"
                )}
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-800">Logline</span>
              <input
                value={logline}
                onChange={(e) => setLogline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-800">Link to film/series</span>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://…"
                className={clsx(
                  "mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2",
                  link && !urlOk
                    ? "border-red-400 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-600"
                )}
                required
              />
            </label>

            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRfdForm(false);
                  resetForm();
                }}
                className="inline-flex justify-center rounded-full px-5 py-2 text-sm font-medium
                           border border-gray-300 text-neutral-800 hover:bg-gray-50"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={!ready}
                className={clsx(
                  "inline-flex justify-center rounded-full px-6 py-2 text-sm font-semibold text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
                  ready
                    ? "bg-purple-600 hover:bg-purple-700 focus:ring-purple-600"
                    : "bg-purple-600/30 cursor-not-allowed"
                )}
              >
                Submit
              </button>
            </div>
          </form>
          )}
        </div>
      ) : (
        /* VIEW: CHOOSER (two cards) */
        <div className="grid gap-8 md:grid-cols-2">
          {/* Originals */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-8 flex flex-col justify-between h-full">
            <div className="mx-auto max-w-md text-center space-y-5 flex flex-col justify-center flex-1">
              <h3 className="text-2xl font-extrabold tracking-tight text-neutral-900">
                Tubi Originals Development
              </h3>
              <p className="text-base leading-relaxed text-neutral-600">
                For pitches, treatments, or scripts you&apos;d like Tubi to consider developing into a Tubi Original.
              </p>
            </div>
            <div className="mt-6 flex justify-center">
              <a
                href={ORIGINALS_SUBMISSION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center w-full sm:w-auto rounded-full px-6 py-3
                           font-semibold text-white
                           bg-purple-600 bg-opacity-20 hover:bg-opacity-100
                           transition-colors duration-200
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600"
              >
                Submit to Originals
              </a>
            </div>
          </div>

          {/* Distribution */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-8 flex flex-col justify-between h-full">
            <div className="mx-auto max-w-md text-center space-y-5 flex flex-col justify-center flex-1">
              <h3 className="text-2xl font-extrabold tracking-tight text-neutral-900">
                Distribution Request
              </h3>
              <p className="text-base leading-relaxed text-neutral-600">
                For completed films or series you&apos;d like to submit for distribution on Tubi.
              </p>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowRfdForm(true)}
                className="inline-flex justify-center w-full sm:w-auto rounded-full px-6 py-3
                           font-semibold text-white
                           bg-purple-600 bg-opacity-20 hover:bg-opacity-100
                           transition-colors duration-200
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600"
              >
                Request Distribution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
