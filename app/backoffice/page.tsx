"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BackofficePage() {
  const [stats, setStats] = useState({
    models: 0,
    colors: 0,
    packs: 0,
    contacts: 0,
    orders: 0,
  });
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/models").then((r) => r.json()),
      fetch("/api/colors").then((r) => r.json()),
      fetch("/api/packs").then((r) => r.json()),
      fetch("/api/contacts").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
    ]).then(([models, colors, packs, contacts, orders]) => {
      setStats({
        models: models.length,
        colors: colors.length,
        packs: packs.length,
        contacts: contacts.length,
        orders: orders?.length ?? 0,
      });
      setContacts(contacts.slice(0, 5));
      setLoading(false);
    });
  }, []);

  const STAT_CARDS = [
    {
      label: "Modèles",
      value: stats.models,
      href: "/backoffice/models",
      color: "#E31F2C",
    },
    {
      label: "Couleurs",
      value: stats.colors,
      href: "/backoffice/colors",
      color: "#6B7280",
    },
    {
      label: "Options",
      value: stats.packs,
      href: "/backoffice/packs",
      color: "#1E2A4A",
    },
    {
      label: "Contacts",
      value: stats.contacts,
      href: "/backoffice/contacts",
      color: "#0D9488",
    },
    {
      label: "Commandes",
      value: stats.orders,
      href: "/backoffice/orders",
      color: "#9958b4",
    },
  ];

  return (
    <div className="px-4 md:px-10 py-6 md:py-10">
      <div className="mb-8">
        <h1 className="font-black text-[24px] md:text-[32px] uppercase tracking-tight">
          Dashboard
        </h1>
        <p className="text-white/40 text-[13px] mt-1">
          Vue d'ensemble de Berizz Auto
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-8">
        {STAT_CARDS.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white/5 border border-white/20 rounded-xl p-4 md:p-6 hover:bg-white/20 transition-colors group"
          >
            <div className="text-[10px] tracking-[2px] uppercase text-white/40 mb-2">
              {card.label}
            </div>
            <div
              className="font-black text-[32px] md:text-[40px] leading-none"
              style={{ color: card.color }}
            >
              {loading ? "—" : card.value}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent contacts */}
      <div className="bg-white/5 border border-white/20 rounded-xl overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-white/20 flex items-center justify-between">
          <h2 className="font-semibold text-[14px]">Derniers contacts</h2>
          <Link
            href="/backoffice/contacts"
            className="text-[11px] text-white/40 hover:text-[#E31F2C] transition-colors"
          >
            Voir tout →
          </Link>
        </div>

        {/* Mobile — cards */}
        <div className="md:hidden flex flex-col divide-y divide-white/5">
          {loading ? (
            <div className="px-4 py-8 text-center text-white/30 text-[13px]">
              Chargement...
            </div>
          ) : contacts.length === 0 ? (
            <div className="px-4 py-8 text-center text-white/30 text-[13px]">
              Aucun contact pour l'instant
            </div>
          ) : (
            contacts.map((c) => (
              <div
                key={c.id}
                className="px-4 py-4 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">
                    {c.name}
                  </div>
                  <div className="text-[11px] text-white/40 truncate">
                    {c.email}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] tracking-[1px] uppercase bg-white/10 px-2 py-0.5 rounded">
                      {c.subject}
                    </span>
                    <span className="text-[11px] text-white/30">
                      {new Date(c.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] tracking-[1px] uppercase px-2 py-1 rounded flex-shrink-0 ${
                    c.read
                      ? "bg-white/5 text-white/30"
                      : "bg-[#E31F2C]/20 text-[#E31F2C]"
                  }`}
                >
                  {c.read ? "Lu" : "Nouveau"}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Desktop — table */}
        <table className="hidden md:table w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left px-6 py-3 text-[11px] tracking-[2px] uppercase text-white/30 font-medium">
                Nom
              </th>
              <th className="text-left px-6 py-3 text-[11px] tracking-[2px] uppercase text-white/30 font-medium">
                Email
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
                  colSpan={5}
                  className="px-6 py-8 text-center text-white/30 text-[13px]"
                >
                  Chargement...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-white/30 text-[13px]"
                >
                  Aucun contact pour l'instant
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-6 py-4 text-[13px] font-medium">
                    {c.name}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-white/50">
                    {c.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] tracking-[2px] uppercase bg-white/10 px-2 py-1 rounded">
                      {c.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[12px] text-white/40">
                    {new Date(c.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] tracking-[2px] uppercase px-2 py-1 rounded ${
                        c.read
                          ? "bg-white/5 text-white/30"
                          : "bg-[#E31F2C]/20 text-[#E31F2C]"
                      }`}
                    >
                      {c.read ? "Lu" : "Nouveau"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
