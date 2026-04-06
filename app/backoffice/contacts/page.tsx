"use client";

import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import { supabase } from "@/lib/supabase-client";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
  read: boolean;
  handled: boolean;
  handled_by: string | null;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    const res = await fetch("/api/contacts");
    setContacts(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(contact: Contact) {
    await fetch(`/api/contacts/${contact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    setSelected({ ...contact, read: true });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    setSelected(null);
    load();
  }

  async function sendReply() {
    if (!selected || !replyText.trim()) return;
    setSending(true);
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_REPLY!,
        {
          to_name: selected.name.split(" ")[0],
          to_email: selected.email,
          email: selected.email,
          subject: selected.subject,
          reply_message: replyText,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      );
      setReplyText("");
      alert("Réponse envoyée !");
    } catch (err) {
      console.error(err);
      alert("Erreur envoi email");
    }
    setSending(false);
  }

  async function markHandled() {
    if (!selected) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await fetch(`/api/contacts/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handled: true, handled_by: user?.email }),
    });
    setSelected({ ...selected, handled: true, handled_by: user?.email ?? "" });
    load();
  }

  const unread = contacts.filter((c) => !c.read).length;

  const DetailPanel = () => (
    <div className="bg-white/5 border border-white/20 rounded-xl p-6 h-fit">
      {/* Bouton retour mobile */}
      <button
        onClick={() => setSelected(null)}
        className="lg:hidden flex items-center gap-2 text-[11px] tracking-[2px] uppercase text-white/40 hover:text-white mb-5"
      >
        <svg width="16" height="8" viewBox="0 0 20 10" fill="none">
          <path
            d="M19 5H1M1 5L6 1M1 5L6 9"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        Retour
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="font-black text-[18px] uppercase tracking-tight">
            {selected!.name}
          </div>
          <div className="text-[12px] text-white/40 mt-1">
            {selected!.email}
          </div>
          {selected!.phone && (
            <div className="text-[12px] text-white/40">{selected!.phone}</div>
          )}
        </div>
        <button
          onClick={() => handleDelete(selected!.id)}
          className="text-[11px] px-3 py-1.5 rounded bg-[#E31F2C]/10 text-[#E31F2C]/60 hover:bg-[#E31F2C]/20 hover:text-[#E31F2C] transition-colors"
        >
          Supprimer
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="text-[10px] tracking-[2px] uppercase bg-white/10 px-2 py-1 rounded">
          {selected!.subject || "—"}
        </span>
        <span className="text-[11px] text-white/30">
          {new Date(selected!.created_at).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="bg-white/3 rounded-lg p-4">
        <p className="text-[14px] text-white/70 leading-relaxed whitespace-pre-wrap">
          {selected!.message}
        </p>
      </div>

      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Votre réponse..."
        rows={4}
        className="w-full mt-5 bg-white/5 border border-white/20 rounded-lg p-3 text-[13px] text-white/80 placeholder-white/20 outline-none resize-none focus:border-white/40"
      />
      <button
        onClick={sendReply}
        disabled={sending || !replyText.trim()}
        className="mt-3 w-full bg-[#E31F2C] text-white py-3 rounded-lg text-[12px] font-semibold tracking-[1px] uppercase hover:bg-[#c41925] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {sending ? "Envoi..." : "Envoyer la réponse"}
      </button>

      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
        <div className="text-[11px]">
          {selected!.handled ? (
            <span className="text-emerald-400">
              ✓ Traité par {selected!.handled_by}
            </span>
          ) : (
            <span className="text-white/20">Non traité</span>
          )}
        </div>
        {!selected!.handled && (
          <button
            onClick={markHandled}
            className="text-[11px] px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
          >
            Marquer traité
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="px-4 md:px-10 py-6 md:py-10">
      <div className="mb-8">
        <h1 className="font-black text-[24px] md:text-[32px] uppercase tracking-tight">
          Contacts
        </h1>
        <p className="text-white/40 text-[13px] mt-1">
          {contacts.length} message{contacts.length > 1 ? "s" : ""}
          {unread > 0 && (
            <span className="ml-2 text-[#E31F2C]">
              · {unread} non lu{unread > 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>

      {/* Mobile : affiche soit la liste soit le détail */}
      <div className="lg:hidden">
        {selected ? (
          <DetailPanel />
        ) : (
          <div className="bg-white/5 border border-white/20 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left px-4 py-3 text-[11px] tracking-[2px] uppercase text-white/30 font-medium">
                    Nom
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] tracking-[2px] uppercase text-white/30 font-medium">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-8 text-center text-white/30 text-[13px]"
                    >
                      Chargement...
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-8 text-center text-white/30 text-[13px]"
                    >
                      Aucun message
                    </td>
                  </tr>
                ) : (
                  contacts.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => {
                        setSelected(c);
                        if (!c.read) markRead(c);
                      }}
                      className="border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {!c.read && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#E31F2C] flex-shrink-0" />
                          )}
                          <span
                            className={`text-[13px] ${!c.read ? "font-semibold" : "text-white/70"}`}
                          >
                            {c.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-white/30 mt-0.5 truncate max-w-[180px]">
                          {c.email}
                        </div>
                        <div className="text-[10px] text-white/20 mt-0.5">
                          {c.subject} ·{" "}
                          {new Date(c.created_at).toLocaleDateString("fr-FR")}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-[10px] tracking-[1px] uppercase px-2 py-0.5 rounded w-fit ${
                              c.read
                                ? "bg-white/5 text-white/30"
                                : "bg-[#E31F2C]/20 text-[#E31F2C]"
                            }`}
                          >
                            {c.read ? "Lu" : "Nouveau"}
                          </span>
                          {c.handled && (
                            <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 w-fit">
                              Traité
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Desktop : layout 2 colonnes */}
      <div className="hidden lg:grid grid-cols-[1fr_420px] gap-6">
        <div className="bg-white/5 border border-white/20 rounded-xl overflow-hidden h-fit">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left px-6 py-3 text-[11px] tracking-[2px] uppercase text-white/30 font-medium">
                  Nom
                </th>
                <th className="text-left px-6 py-3 text-[11px] tracking-[2px] uppercase text-white/30 font-medium">
                  Sujet
                </th>
                <th className="text-left px-6 py-3 text-[11px] tracking-[2px] uppercase text-white/30 font-medium">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-[11px] tracking-[2px] uppercase text-white/30 font-medium">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-white/30 text-[13px]"
                  >
                    Chargement...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-white/30 text-[13px]"
                  >
                    Aucun message
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => {
                      setSelected(c);
                      if (!c.read) markRead(c);
                    }}
                    className={`border-b border-white/5 cursor-pointer transition-colors ${
                      selected?.id === c.id ? "bg-white/20" : "hover:bg-white/3"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!c.read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#E31F2C] flex-shrink-0" />
                        )}
                        <span
                          className={`text-[13px] ${!c.read ? "font-semibold" : "text-white/70"}`}
                        >
                          {c.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-white/30 mt-0.5">
                        {c.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] tracking-[2px] uppercase bg-white/10 px-2 py-1 rounded">
                        {c.subject || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[12px] text-white/40">
                      {new Date(c.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`text-[10px] tracking-[2px] uppercase px-2 py-1 rounded w-fit ${
                            c.read
                              ? "bg-white/5 text-white/30"
                              : "bg-[#E31F2C]/20 text-[#E31F2C]"
                          }`}
                        >
                          {c.read ? "Lu" : "Nouveau"}
                        </span>
                        {c.handled && (
                          <span className="text-[10px] tracking-[2px] uppercase px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 w-fit">
                            Traité
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selected ? (
          <DetailPanel />
        ) : (
          <div className="bg-white/5 border border-white/30 rounded-xl p-6 flex items-center justify-center text-white/20 text-[13px] h-48">
            Sélectionne un message
          </div>
        )}
      </div>
    </div>
  );
}
