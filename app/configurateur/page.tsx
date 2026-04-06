"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

type Color = { id: string; name: string; hex: string; price: number };
type Pack = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  image: string | null;
};
type ModelColorImage = {
  color_id: string;
  image_path: string;
  is_default: boolean;
  colors: Color;
};
type Model = {
  id: string;
  name: string;
  tagline: string;
  base_price: number;
  image: string;
  active: boolean;
  model_color_images: ModelColorImage[];
};

const STEPS = ["Modèle", "Couleur", "Options", "Récapitulatif"];

function formatPrice(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function getCarImage(model: Model, colorId: string): string {
  const match = model.model_color_images?.find((ci) => ci.color_id === colorId);
  return match?.image_path ?? model.image;
}

function getDefaultColor(model: Model, colors: Color[]): Color {
  const defaultImg = model.model_color_images?.find((ci) => ci.is_default);
  if (defaultImg) {
    const color = colors.find((c) => c.id === defaultImg.color_id);
    if (color) return color;
  }
  return colors[0];
}

function ConfigurateurContent() {
  const searchParams = useSearchParams();
  const [models, setModels] = useState<Model[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/models").then((r) => r.json()),
      fetch("/api/colors").then((r) => r.json()),
      fetch("/api/packs").then((r) => r.json()),
    ]).then(([modelsData, colorsData, packsData]) => {
      setModels(modelsData);
      setColors(colorsData);
      setPacks(packsData);

      if (modelsData.length > 0 && colorsData.length > 0) {
        // Présélection depuis query param ?model=ID
        const modelParam = searchParams.get("model");
        const defaultModel = modelParam
          ? (modelsData.find((m: Model) => m.id === modelParam) ??
            modelsData[0])
          : modelsData[0];

        setSelectedModel(defaultModel);
        setSelectedColor(getDefaultColor(defaultModel, colorsData));
      }
      setLoading(false);
    });
  }, []);

  const totalPrice =
    selectedModel && selectedColor
      ? selectedModel.base_price +
        selectedColor.price +
        selectedPacks.reduce(
          (sum, id) => sum + (packs.find((p) => p.id === id)?.price ?? 0),
          0,
        )
      : 0;

  function selectModel(model: Model) {
    setSelectedModel(model);
    setSelectedColor(getDefaultColor(model, colors));
  }

  function togglePack(id: string) {
    setSelectedPacks((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function saveConfig() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login?redirect=/configurateur";
      return;
    }
    if (!selectedModel || !selectedColor) return;

    const configParam = searchParams.get("config");

    if (configParam) {
      await supabase
        .from("configurations")
        .update({
          model_id: selectedModel.id,
          color_id: selectedColor.id,
          packs: selectedPacks,
          total_price: totalPrice,
        })
        .eq("id", configParam);
    } else {
      const { data: newConfig, error: configError } = await supabase
        .from("configurations")
        .insert({
          user_id: user.id,
          model_id: selectedModel.id,
          color_id: selectedColor.id,
          packs: selectedPacks,
          total_price: totalPrice,
        })
        .select()
        .single();

      if (configError) {
        console.error("Config error:", configError);
        return;
      }

      if (newConfig) {
        const { error: orderError } = await supabase.from("orders").insert({
          user_id: user.id,
          model_id: selectedModel.id,
          color_id: selectedColor.id,
          packs: selectedPacks,
          total_price: totalPrice,
          status: "en_attente",
        });
        if (orderError) console.error("Order error:", orderError);
      }
    }
  }

  function next() {
    if (step < 3) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  function prev() {
    if (step > 0) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const currentCarImage =
    selectedModel && selectedColor
      ? getCarImage(selectedModel, selectedColor.id)
      : "";

  if (loading)
    return (
      <main className="min-h-screen bg-[#f5f5f7] pt-[52px] flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-black/20 border-t-[#E31F2C] rounded-full animate-spin" />
          <p className="text-[12px] tracking-[3px] uppercase text-black/40">
            Chargement...
          </p>
        </div>
      </main>
    );

  if (!selectedModel || !selectedColor) return null;

  return (
    <main className="min-h-screen bg-[#f5f5f7] pt-[52px]">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-black/8 px-8 md:px-20 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-[11px] tracking-[3px] uppercase text-black/80 hover:text-[#E31F2C] transition-colors mb-4 w-fit"
          >
            <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
              <path
                d="M19 5H1M1 5L6 1M1 5L6 9"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            Retour
          </Link>
          <h1 className="font-black text-[clamp(32px,5vw,64px)] uppercase tracking-tight leading-none">
            Configurez votre{" "}
            <em className="text-[#E31F2C] not-italic">Berizz.</em>
          </h1>
        </motion.div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-b border-black/8 px-8 md:px-20 py-4">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 text-[11px] tracking-[2px] uppercase font-medium transition-colors duration-300 ${
                  i === step
                    ? "text-black"
                    : i < step
                      ? "text-[#E31F2C] cursor-pointer"
                      : "text-black/30 cursor-default"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all duration-300 ${
                    i === step
                      ? "bg-black text-white"
                      : i < step
                        ? "bg-[#E31F2C] text-white"
                        : "bg-black/10 text-black/40"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </span>
                <span className="hidden sm:block">{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 md:w-16 h-px mx-3 transition-colors duration-500 ${i < step ? "bg-[#E31F2C]" : "bg-black/15"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)]">
        {/* Left */}
        <div className="flex-1 px-8 md:px-20 py-12 md:py-16">
          <AnimatePresence mode="wait">
            {/* Step 0 — Modèle */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-[11px] font-medium tracking-[5px] uppercase text-[#E31F2C] mb-3">
                  Étape 1
                </p>
                <h2 className="font-black text-[clamp(32px,4vw,56px)] uppercase tracking-tight leading-[0.9] mb-10">
                  Choisissez
                  <br />
                  votre modèle.
                </h2>
                <div className="flex flex-col gap-4">
                  {models
                    .filter((m) => m.active)
                    .map((model) => {
                      const isSelected = selectedModel.id === model.id;
                      const defaultImg = getCarImage(
                        model,
                        getDefaultColor(model, colors).id,
                      );
                      return (
                        <button
                          key={model.id}
                          onClick={() => selectModel(model)}
                          className={`relative flex items-center gap-6 p-5 md:p-7 border-2 transition-all duration-300 text-left group ${
                            isSelected
                              ? "border-[#E31F2C] bg-white"
                              : "border-black/10 bg-white hover:border-black/30"
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="modelSelected"
                              className="absolute inset-0 bg-[#E31F2C]/[0.03]"
                            />
                          )}
                          {isSelected && (
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E31F2C]" />
                          )}
                          <div className="relative w-28 md:w-36 h-20 flex-shrink-0">
                            <Image
                              src={defaultImg}
                              alt={model.name}
                              fill
                              className="object-contain mix-blend-multiply"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-black text-[20px] md:text-[24px] uppercase tracking-tight">
                              {model.name}
                            </div>
                            <div className="text-[13px] font-light text-[#6e6e73] mt-1">
                              {model.tagline}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 pr-2">
                            <div className="text-[10px] font-light text-[#6e6e73] tracking-wide">
                              À partir de
                            </div>
                            <div
                              className={`font-bold text-[18px] transition-colors duration-300 ${isSelected ? "text-[#E31F2C]" : "text-black"}`}
                            >
                              {formatPrice(model.base_price)}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* Step 1 — Couleur */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-[11px] font-medium tracking-[5px] uppercase text-[#E31F2C] mb-3">
                  Étape 2
                </p>
                <h2 className="font-black text-[clamp(32px,4vw,56px)] uppercase tracking-tight leading-[0.9] mb-10">
                  Votre
                  <br />
                  couleur.
                </h2>
                <div className="flex flex-col gap-3">
                  {colors.map((color) => {
                    const isSelected = selectedColor.id === color.id;
                    return (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color)}
                        className={`relative flex items-center gap-5 p-5 border-2 transition-all duration-300 text-left group ${
                          isSelected
                            ? "border-[#E31F2C] bg-white"
                            : "border-black/10 bg-white hover:border-black/30"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E31F2C]" />
                        )}
                        <div
                          className={`w-10 h-10 rounded-full flex-shrink-0 transition-all duration-300 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}
                          style={{
                            backgroundColor: color.hex,
                            border: "2px solid rgba(0,0,0,0.1)",
                          }}
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-[15px] tracking-wide">
                            {color.name}
                          </div>
                        </div>
                        <div
                          className={`text-right text-[13px] font-light transition-colors duration-300 ${isSelected ? "text-[#E31F2C] font-medium" : "text-[#6e6e73]"}`}
                        >
                          {color.price > 0
                            ? `+${formatPrice(color.price)}`
                            : "Inclus"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2 — Options */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-[11px] font-medium tracking-[5px] uppercase text-[#E31F2C] mb-3">
                  Étape 3
                </p>
                <h2 className="font-black text-[clamp(32px,4vw,56px)] uppercase tracking-tight leading-[0.9] mb-3">
                  Vos
                  <br />
                  options.
                </h2>
                <p className="text-[13px] font-light text-[#6e6e73] mb-10">
                  Sélectionnez autant de packs que souhaité.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packs.map((pack) => {
                    const isSelected = selectedPacks.includes(pack.id);
                    return (
                        <button
                            key={pack.id}
                            onClick={() => togglePack(pack.id)}
                            className={`relative border-2 text-left transition-all duration-300 overflow-hidden ${
                                isSelected
                                    ? "border-[#E31F2C] bg-white"
                                    : "border-black/10 bg-white hover:border-black/30"
                            }`}
                        >
                          {isSelected && (
                              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E31F2C] z-10"/>
                          )}
                          {/* Image */}
                          {pack.image && (
                              <div className="relative w-full h-32 bg-[#f5f5f7] overflow-hidden">
                                <Image src={pack.image} alt={pack.name} fill className="object-cover"/>
                              </div>
                          )}
                          <div className="p-6">
                            <div className="text-2xl mb-3">{pack.icon}</div>
                            <div className="font-black text-[18px] uppercase tracking-tight mb-1">
                              {pack.name}
                            </div>
                            <div className="text-[12px] font-light text-[#6e6e73] mb-4 leading-relaxed">
                              {pack.description}
                            </div>
                            <div
                                className={`font-semibold text-[15px] transition-colors duration-300 ${isSelected ? "text-[#E31F2C]" : ""}`}>
                              +{formatPrice(pack.price)}
                            </div>
                          </div>
                        </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3 — Récapitulatif */}
            {step === 3 && (
                <motion.div
                    key="step-3"
                    initial={{opacity: 0, x: 30}}
                    animate={{opacity: 1, x: 0}}
                    exit={{opacity: 0, x: -30}}
                    transition={{duration: 0.4, ease: [0.16, 1, 0.3, 1]}}
                >
                  <p className="text-[11px] font-medium tracking-[5px] uppercase text-[#E31F2C] mb-3">
                    Récapitulatif
                  </p>
                  <h2 className="font-black text-[clamp(32px,4vw,56px)] uppercase tracking-tight leading-[0.9] mb-10">
                    Votre
                    <br/>
                    <em className="text-[#E31F2C] not-italic">configuration.</em>
                  </h2>
                  <div className="flex flex-col divide-y divide-black/10">
                    <div className="flex justify-between items-center py-5">
                      <div>
                      <div className="font-black text-[18px] uppercase tracking-tight">
                        {selectedModel.name}
                      </div>
                      <div className="text-[12px] font-light text-[#6e6e73]">
                        {selectedModel.tagline}
                      </div>
                    </div>
                    <div className="font-semibold text-[16px]">
                      {formatPrice(selectedModel.base_price)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: selectedColor.hex,
                          border: "1px solid rgba(0,0,0,0.1)",
                        }}
                      />
                      <div>
                        <div className="font-semibold text-[15px]">
                          {selectedColor.name}
                        </div>
                        <div className="text-[12px] font-light text-[#6e6e73]">
                          Couleur extérieure
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-[16px]">
                      {selectedColor.price > 0
                        ? `+${formatPrice(selectedColor.price)}`
                        : "Inclus"}
                    </div>
                  </div>
                  {selectedPacks.map((id) => {
                    const pack = packs.find((p) => p.id === id)!;
                    return (
                      <div
                        key={id}
                        className="flex justify-between items-center py-5"
                      >
                        <div>
                          <div className="font-semibold text-[15px]">
                            {pack.name}
                          </div>
                          <div className="text-[12px] font-light text-[#6e6e73]">
                            Option
                          </div>
                        </div>
                        <div className="font-semibold text-[16px]">
                          +{formatPrice(pack.price)}
                        </div>
                      </div>
                    );
                  })}
                  {selectedPacks.length === 0 && (
                    <div className="py-5 text-[13px] font-light text-[#6e6e73] italic">
                      Aucune option sélectionnée
                    </div>
                  )}
                </div>
                <div className="mt-8 pt-6 border-t-2 border-black flex justify-between items-center">
                  <div className="font-black text-[20px] uppercase tracking-tight">
                    Total
                  </div>
                  <div className="font-black text-[28px] tracking-tight text-[#E31F2C]">
                    {formatPrice(totalPrice)}
                  </div>
                </div>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={async () => {
                      await saveConfig();
                      window.location.href = "/contact";
                    }}
                    className="bg-black text-white px-10 py-4 text-[12px] font-semibold tracking-[2px] uppercase rounded-full hover:bg-[#E31F2C] transition-colors duration-300 text-center flex-1"
                  >
                    Finaliser & Prendre RDV
                  </button>
                  <button
                    onClick={() => setStep(0)}
                    className="border border-black/25 text-black px-10 py-4 text-[12px] font-light tracking-[2px] uppercase rounded-full hover:border-[#E31F2C] hover:text-[#E31F2C] transition-colors duration-300"
                  >
                    Recommencer
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Desktop sidebar */}
        <div className="hidden lg:block lg:w-[420px] xl:w-[460px] bg-white border-l border-black/8 px-8 py-12 flex-shrink-0">
          <div className="sticky top-[52px]">
            <div className="relative w-full aspect-[4/3] mb-8 bg-[#f5f5f7] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCarImage}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={currentCarImage}
                    alt={selectedModel.name}
                    fill
                    className="object-contain mix-blend-multiply"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mb-6">
              <div className="text-[10px] tracking-[3px] uppercase text-[#6e6e73] mb-1">
                {selectedModel.tagline}
              </div>
              <div className="font-black text-[24px] uppercase tracking-tight">
                {selectedModel.name}
              </div>
            </div>
            <div className="flex items-center gap-3 mb-6 p-3 bg-[#f5f5f7]">
              <div
                className="w-5 h-5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: selectedColor.hex,
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              />
              <span className="text-[12px] font-medium tracking-wide">
                {selectedColor.name}
              </span>
            </div>
            {selectedPacks.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedPacks.map((id) => (
                  <span
                    key={id}
                    className="text-[10px] tracking-[2px] uppercase font-medium bg-black/5 px-3 py-1"
                  >
                    {packs.find((p) => p.id === id)?.name}
                  </span>
                ))}
              </div>
            )}
            <div className="border-t border-black/10 pt-6">
              <div className="text-[10px] tracking-[3px] uppercase text-[#6e6e73] mb-1">
                Prix total estimé
              </div>
              <motion.div
                key={totalPrice}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="font-black text-[32px] tracking-tight"
              >
                {formatPrice(totalPrice)}
              </motion.div>
              <p className="text-[11px] font-light text-[#6e6e73] mt-3 leading-relaxed">
                Prix indicatif hors malus écologique. Financement disponible.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile preview banner */}
      {step < 3 && (
        <div className="lg:hidden bg-white border-t border-black/8 px-6 py-4 flex items-center gap-4">
          <div className="relative w-24 h-16 bg-[#f5f5f7] flex-shrink-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCarImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={currentCarImage}
                  alt={selectedModel.name}
                  fill
                  className="object-contain mix-blend-multiply"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-[15px] uppercase tracking-tight truncate">
              {selectedModel.name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: selectedColor.hex,
                  border: "1px solid rgba(0,0,0,0.15)",
                }}
              />
              <span className="text-[11px] text-[#6e6e73] truncate">
                {selectedColor.name}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-[10px] tracking-[2px] uppercase text-[#6e6e73]">
              Total
            </div>
            <motion.div
              key={totalPrice}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="font-black text-[18px] tracking-tight text-[#E31F2C]"
            >
              {formatPrice(totalPrice)}
            </motion.div>
          </div>
        </div>
      )}

      {/* Buttons */}
      {step < 3 && (
        <div className="flex justify-end px-8 md:px-20 py-6 flex gap-4 bg-[#f5f5f7]">
          {step > 0 && (
            <button
              onClick={prev}
              className="border border-black/25 text-black px-8 py-3 text-[12px] font-light tracking-[2px] uppercase rounded-full hover:border-black transition-colors"
            >
              Retour
            </button>
          )}
          <button
            onClick={next}
            className="bg-black text-white px-10 py-3 text-[12px] font-semibold tracking-[2px] uppercase rounded-full hover:bg-[#E31F2C] transition-colors duration-300"
          >
            {step === 2 ? "Voir le récap" : "Continuer"}
          </button>
        </div>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f5f5f7] pt-[52px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-black/20 border-t-[#E31F2C] rounded-full animate-spin" />
            <p className="text-[12px] tracking-[3px] uppercase text-black/40">
              Chargement...
            </p>
          </div>
        </main>
      }
    >
      <ConfigurateurContent />
    </Suspense>
  );
}
