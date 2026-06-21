"use client";

import { useRef, useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, CheckCircle2, FileImage, X, Send } from "lucide-react";
import Reveal from "./Reveal";

type Status = "idle" | "submitting" | "success";

export default function RefillForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (file) setFileName(file.name);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    // NOTE: wire this up to your backend (API route, Supabase, email service, etc.)
    setTimeout(() => setStatus("success"), 1400);
  };

  const reset = () => {
    setStatus("idle");
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section id="refill" className="relative bg-surface py-24 dark:bg-midnight">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 sm:px-8 lg:grid-cols-5 lg:gap-16">
        <Reveal className="lg:col-span-2">
          <span className="section-badge">Online Refill</span>
          <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Refill in minutes, not in line
          </h2>
          <p className="mt-4 text-ink/60 dark:text-white/60">
            Send us your prescription details and we&apos;ll have it ready for
            pickup or out for delivery. We&apos;ll text or call to confirm.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "Submitted refills are typically ready the same day",
              "Upload a photo of your prescription label for faster processing",
              "Choose delivery at checkout if you can't make it in",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ink/70 dark:text-white/70">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-3">
          <div className="glass-card relative overflow-hidden rounded-5xl p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-gradient shadow-glow-green"
                  >
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </motion.div>
                  <h3 className="mt-6 font-display text-2xl font-bold">
                    Refill request received
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-ink/60 dark:text-white/60">
                    Thank you! Our pharmacy team will review your request and
                    contact you shortly to confirm pickup or delivery.
                  </p>
                  <button onClick={reset} className="btn-secondary mt-8">
                    Submit another refill
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 gap-5 sm:grid-cols-2"
                >
                  <Field label="Full Name" required>
                    <input
                      required
                      type="text"
                      placeholder="Jane Rivera"
                      className="form-input"
                    />
                  </Field>
                  <Field label="Phone Number" required>
                    <input
                      required
                      type="tel"
                      placeholder="(787) 000-0000"
                      className="form-input"
                    />
                  </Field>
                  <Field label="Date of Birth" required>
                    <input required type="date" className="form-input" />
                  </Field>
                  <Field label="Prescription Number" required>
                    <input
                      required
                      type="text"
                      placeholder="RX-000000"
                      className="form-input"
                    />
                  </Field>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-ink/70 dark:text-white/70">
                      Upload Prescription Image
                    </label>
                    <label
                      htmlFor="prescription-upload"
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-ink/15 bg-surface-soft px-6 py-8 text-center transition-colors hover:border-brand-aqua/50 dark:border-white/15 dark:bg-white/[0.03]"
                    >
                      {fileName ? (
                        <div className="flex items-center gap-2 text-sm font-medium text-ink dark:text-white">
                          <FileImage className="h-5 w-5 text-brand-green" />
                          {fileName}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              reset();
                            }}
                            aria-label="Remove file"
                            className="ml-1 text-ink/40 hover:text-brand-red"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-brand-aqua" />
                          <p className="text-sm text-ink/60 dark:text-white/60">
                            Tap to upload a photo of your prescription
                          </p>
                          <p className="text-xs text-ink/40 dark:text-white/40">
                            PNG or JPG, up to 10MB
                          </p>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        id="prescription-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="btn-primary mt-2 sm:col-span-2"
                  >
                    {status === "submitting" ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Refill
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-ink/70 dark:text-white/70">
        {label}
        {required && <span className="text-brand-red"> *</span>}
      </label>
      {children}
    </div>
  );
}
