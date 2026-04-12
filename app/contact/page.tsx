"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import { supabase } from "@/lib/supabase-client";
import Footer from "@/components/ui/Footer";
import emailjs from '@emailjs/browser'

type Subject = "rdv" | "config" | "info" | "presse" | "";

const SUBJECTS: { id: Subject; label: string; desc: string }[] = [
  {
    id: "rdv",
    label: "Prendre RDV",
    desc: "Rencontrer un conseiller en showroom",
  },
  {
    id: "config",
    label: "Configuration",
    desc: "Aide pour configurer votre Berizz",
  },
  { id: "info", label: "Informations", desc: "Renseignements sur la gamme" },
  { id: "presse", label: "Presse", desc: "Demande média ou partenariat" },
];

export default function Page() {
  const formRef = useRef(null);
  const infoRef = useRef(null);
  const formInView = useInView(formRef, { once: true, margin: "-80px" });
  const infoInView = useInView(infoRef, { once: true, margin: "-80px" });

  const [subject, setSubject] = useState<Subject>("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const { data: { user } } = await supabase.auth.getUser()

    await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        subject: subject,
        user_id: user?.id,
        read: false,
      }),
    })

    // Envoi confirmation EmailJS
    try {
      await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CONTACT!,
          {
            to_name: form.name.split(' ')[0],
            to_email: form.email,
            email: form.email,
            subject: SUBJECTS.find(s => s.id === subject)?.label ?? subject,
            message: form.message,
          },
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )
    } catch (err) {
      console.error('EmailJS error:', JSON.stringify(err))
    }

    setSubmitted(true)
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <main className="bg-white min-h-screen">
      <Navbar />

      {/* Hero — pas de pt-[52px], la navbar est transparente sur le noir */}
      <section className="bg-black text-white px-8 md:px-20 py-28 md:py-40 relative overflow-hidden">
        <span className="absolute font-black text-[28vw] uppercase tracking-tight text-white/[0.03] pointer-events-none leading-none bottom-0 right-0 select-none">
          CONTACT
        </span>
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <Link
              href="/"
              className="flex items-center gap-2 text-[11px] tracking-[3px] uppercase text-white/40 hover:text-[#E31F2C] transition-colors w-fit mb-8"
            >
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                <path
                  d="M19 5H1M1 5L6 1M1 5L6 9"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              Accueil
            </Link>
            <span className="text-[11px] font-medium tracking-[5px] uppercase text-[#E31F2C] block mb-5">
              Contact
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9 }}
            className="font-black text-[clamp(56px,9vw,140px)] uppercase tracking-tight leading-[0.85]"
          >
            Parlons
            <br />
            <em className="text-[#E31F2C] not-italic">ensemble.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-[15px] font-light text-white/50 mt-8 max-w-md leading-relaxed"
          >
            Une question, un projet, une visite en showroom — notre équipe vous
            répond sous 24h.
          </motion.p>
        </div>
      </section>

      {/* Main */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
        {/* Form side */}
        <div
          ref={formRef}
          className="px-8 md:px-16 py-16 md:py-24 border-r border-black/8"
        >
          {!submitted ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={formInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7 }}
                className="mb-10"
              >
                <p className="text-[11px] font-medium tracking-[5px] uppercase text-[#E31F2C] mb-5">
                  Sujet
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSubject(s.id)}
                      className={`p-4 border-2 text-left transition-all duration-300 group ${
                        subject === s.id
                          ? "border-[#E31F2C] bg-[#E31F2C]/[0.03]"
                          : "border-black/10 hover:border-black/30"
                      }`}
                    >
                      <div className="font-semibold text-[13px] tracking-wide mb-1">
                        {s.label}
                      </div>
                      <div className="text-[11px] font-light text-[#6e6e73] leading-snug">
                        {s.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 30 }}
                animate={formInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15, duration: 0.8 }}
                className="flex flex-col gap-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    {
                      name: "name",
                      label: "Nom complet",
                      type: "text",
                      placeholder: "Jean Dupont",
                    },
                    {
                      name: "email",
                      label: "Email",
                      type: "email",
                      placeholder: "jean@exemple.fr",
                    },
                  ].map((field) => (
                    <div key={field.name} className="flex flex-col gap-2">
                      <label className="text-[11px] font-medium tracking-[3px] uppercase text-black/50">
                        {field.label}
                      </label>
                      <div
                        className={`relative border-b-2 transition-colors duration-300 ${
                          focused === field.name
                            ? "border-[#E31F2C]"
                            : "border-black/15"
                        }`}
                      >
                        <input
                          type={field.type}
                          name={field.name}
                          value={form[field.name as keyof typeof form]}
                          onChange={handleChange}
                          onFocus={() => setFocused(field.name)}
                          onBlur={() => setFocused(null)}
                          placeholder={field.placeholder}
                          required
                          className="w-full bg-transparent pb-3 pt-1 text-[15px] font-light text-black placeholder-black/25 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-medium tracking-[3px] uppercase text-black/50">
                    Téléphone{" "}
                    <span className="text-black/25 normal-case tracking-normal font-light">
                      (optionnel)
                    </span>
                  </label>
                  <div
                    className={`relative border-b-2 transition-colors duration-300 ${
                      focused === "phone"
                        ? "border-[#E31F2C]"
                        : "border-black/15"
                    }`}
                  >
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      onFocus={() => setFocused("phone")}
                      onBlur={() => setFocused(null)}
                      placeholder="+33 6 00 00 00 00"
                      className="w-full bg-transparent pb-3 pt-1 text-[15px] font-light text-black placeholder-black/25 outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-medium tracking-[3px] uppercase text-black/50">
                    Message
                  </label>
                  <div
                    className={`relative border-b-2 transition-colors duration-300 ${
                      focused === "message"
                        ? "border-[#E31F2C]"
                        : "border-black/15"
                    }`}
                  >
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      onFocus={() => setFocused("message")}
                      onBlur={() => setFocused(null)}
                      placeholder="Décrivez votre projet ou votre demande…"
                      rows={4}
                      required
                      className="w-full bg-transparent pb-3 pt-1 text-[15px] font-light text-black placeholder-black/25 outline-none resize-none"
                    />
                  </div>
                </div>

                <p className="text-[11px] font-light text-[#6e6e73] leading-relaxed">
                  En soumettant ce formulaire, vous acceptez notre{" "}
                  <a
                    href="#"
                    className="underline hover:text-[#E31F2C] transition-colors"
                  >
                    politique de confidentialité
                  </a>
                  .
                </p>

                <button
                  type="submit"
                  className="self-start bg-black text-white px-12 py-4 text-[12px] font-semibold tracking-[2px] uppercase rounded-full hover:bg-[#E31F2C] transition-colors duration-300"
                >
                  Envoyer le message
                </button>
              </motion.form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-full flex flex-col justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#E31F2C] flex items-center justify-center mb-8">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13L9 17L19 7"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="font-black text-[clamp(32px,4vw,56px)] uppercase tracking-tight leading-[0.9] mb-6">
                Message
                <br />
                <em className="text-[#E31F2C] not-italic">envoyé.</em>
              </h2>
              <p className="text-[15px] font-light text-[#6e6e73] leading-relaxed max-w-sm mb-10">
                Merci {form.name.split(" ")[0]} — notre équipe vous contactera
                dans les 24h ouvrées.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", email: "", phone: "", message: "" });
                  setSubject("");
                }}
                className="self-start border border-black/25 text-black px-8 py-3 text-[12px] font-light tracking-[2px] uppercase rounded-full hover:border-[#E31F2C] hover:text-[#E31F2C] transition-colors duration-300"
              >
                Nouveau message
              </button>
            </motion.div>
          )}
        </div>

        {/* Info side */}
        <div
          ref={infoRef}
          className="px-8 md:px-16 py-16 md:py-24 bg-[#f5f5f7]"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={infoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[11px] font-medium tracking-[5px] uppercase text-[#E31F2C] mb-10">
              Showroom
            </p>

            <div className="mb-12">
              <h3 className="font-black text-[20px] uppercase tracking-tight mb-3">
                Berizz Paris
              </h3>
              <p className="text-[15px] font-light text-[#6e6e73] leading-relaxed">
                12 Avenue Montaigne
                <br />
                75008 Paris, France
              </p>
            </div>

            <div className="mb-12">
              <h3 className="font-black text-[14px] uppercase tracking-[3px] mb-4 text-black/50">
                Horaires
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { day: "Lundi — Vendredi", hours: "9h00 — 19h00" },
                  { day: "Samedi", hours: "10h00 — 18h00" },
                  { day: "Dimanche", hours: "Sur rendez-vous" },
                ].map((h) => (
                  <div
                    key={h.day}
                    className="flex justify-between items-center py-3 border-b border-black/8"
                  >
                    <span className="text-[13px] font-light text-[#6e6e73]">
                      {h.day}
                    </span>
                    <span className="text-[13px] font-semibold tracking-wide">
                      {h.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h3 className="font-black text-[14px] uppercase tracking-[3px] mb-4 text-black/50">
                Direct
              </h3>
              <div className="flex flex-col gap-3">
                <a
                  href="tel:+33142000000"
                  className="flex items-center gap-3 text-[14px] font-light hover:text-[#E31F2C] transition-colors group"
                >
                  <span className="w-8 h-8 bg-black rounded-full flex items-center justify-center group-hover:bg-[#E31F2C] transition-colors flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.61 3.41 2 2 0 013.59 1.23h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.91a16 16 0 006.72 6.72l.95-.95a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  +33 1 42 00 00 00
                </a>
                <a
                  href="mailto:contact@berizz-auto.fr"
                  className="flex items-center gap-3 text-[14px] font-light hover:text-[#E31F2C] transition-colors group"
                >
                  <span className="w-8 h-8 bg-black rounded-full flex items-center justify-center group-hover:bg-[#E31F2C] transition-colors flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points="22,6 12,13 2,6"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  contact@berizz-auto.fr
                </a>
              </div>
            </div>

            <div className="p-6 bg-black text-white">
              <div className="text-[11px] tracking-[3px] uppercase text-[#E31F2C] mb-3">
                Essai disponible
              </div>
              <p className="text-[14px] font-light text-white/70 leading-relaxed mb-5">
                Découvrez la GT-R Apex sur circuit. Essai privé sur rendez-vous
                uniquement.
              </p>
              <Link
                href="/configurateur"
                className="inline-block bg-white text-black px-6 py-3 text-[11px] font-semibold tracking-[2px] uppercase rounded-full hover:bg-[#E31F2C] hover:text-white transition-colors duration-300"
              >
                Réserver un essai
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
