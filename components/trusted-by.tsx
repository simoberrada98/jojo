"use client";

import type { ReactElement } from "react";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type Brand = {
  name: string;
  subtitle: string;
  logo: ReactElement;
};

const brands: Brand[] = [
  {
    name: "Bitmain",
    subtitle: "ASIC Innovators",
    logo: (
      <svg
        viewBox="0 0 120 48"
        className="w-full h-12 text-sky-400"
        aria-hidden="true"
        focusable="false"
      >
        <rect
          x="4"
          y="6"
          width="112"
          height="36"
          rx="12"
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeOpacity={0.4}
        />
        <path
          d="M34 16h14c5.5 0 9 2.7 9 7s-3.5 7-9 7h-5v6H34V16Zm9 10c1.8 0 3-1 3-3s-1.2-3-3-3h-3v6h3Z"
          fill="currentColor"
        />
        <path
          d="M66 16h22v6h-7v14h-8V22h-7z"
          fill="currentColor"
          className="opacity-90"
        />
      </svg>
    ),
  },
  {
    name: "MicroBT",
    subtitle: "WhatsMiner Specialists",
    logo: (
      <svg
        viewBox="0 0 120 48"
        className="w-full h-12 text-emerald-400"
        aria-hidden="true"
        focusable="false"
      >
        <rect
          x="6"
          y="8"
          width="108"
          height="32"
          rx="10"
          fill="currentColor"
          opacity={0.1}
        />
        <path
          d="M24 32V16h6l4 6 4-6h6v16h-6v-7l-4 6h-0.1l-4-6v7z"
          fill="currentColor"
        />
        <circle
          cx="78"
          cy="24"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
        />
        <path d="M88 16h8v16h-8z" fill="currentColor" opacity={0.8} />
      </svg>
    ),
  },
  {
    name: "NVIDIA",
    subtitle: "GPU Performance",
    logo: (
      <svg
        viewBox="0 0 120 48"
        className="w-full h-12 text-lime-300"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M8 14h64l16 10-16 10H8z" fill="currentColor" opacity={0.15} />
        <path d="M28 16h10l5 8-5 8H28l5-8z" fill="currentColor" />
        <path
          d="M64 24c0 7.3 5.7 13 13 13s13-5.7 13-13-5.7-13-13-13-13 5.7-13 13Zm18 0a5 5 0 1 1-5-5 5 5 0 0 1 5 5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "AMD",
    subtitle: "Efficient Hashing",
    logo: (
      <svg
        viewBox="0 0 120 48"
        className="w-full h-12 text-rose-400"
        aria-hidden="true"
        focusable="false"
      >
        <rect
          x="8"
          y="10"
          width="104"
          height="28"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeOpacity={0.5}
        />
        <path
          d="M30 32 36 16h8l6 16h-6l-1-3h-6l-1 3zm9-8 2 5 2-5z"
          fill="currentColor"
        />
        <path
          d="M56 16h6l6 8-6 8h-6l6-8zM76 16h10c6.6 0 11 3.8 11 9s-4.4 9-11 9H76z"
          fill="currentColor"
          opacity={0.9}
        />
      </svg>
    ),
  },
  {
    name: "Intel",
    subtitle: "Server-Grade Reliability",
    logo: (
      <svg
        viewBox="0 0 120 48"
        className="w-full h-12 text-sky-300"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="60"
          cy="24"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.6}
          strokeWidth={3}
        />
        <path
          d="M52 24c0-4.4 3.6-8 8-8h10v6h-8a2 2 0 0 0 0 4h6c3.3 0 6 2.7 6 6s-2.7 6-6 6H60c-4.4 0-8-3.6-8-8Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "Coinbase",
    subtitle: "Global Exchange Partner",
    logo: (
      <svg
        viewBox="0 0 120 48"
        className="w-full h-12 text-blue-400"
        aria-hidden="true"
        focusable="false"
      >
        <rect
          x="12"
          y="8"
          width="96"
          height="32"
          rx="16"
          fill="currentColor"
          opacity={0.12}
        />
        <circle cx="44" cy="24" r="8" fill="currentColor" />
        <rect
          x="76"
          y="16"
          width="20"
          height="16"
          rx="8"
          fill="currentColor"
          opacity={0.85}
        />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as any },
  },
};

export default function TrustedBySection() {
  return (
    <section className="relative py-20 sm:py-24">
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-br from-background via-background/95 to-background/80 pointer-events-none"
      />
      <div className="relative mx-auto px-6 max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 mb-4 px-4 py-1 border border-accent/40 rounded-full font-semibold text-accent text-sm uppercase tracking-wide">
            Trusted By
          </div>
          <h2 className="font-tech font-semibold text-foreground text-3xl sm:text-4xl tracking-tight">
            Partnered with industry-leading innovators
          </h2>
          <p className="mt-4 text-foreground/70 text-base sm:text-lg">
            From silicon design to global exchanges, we work alongside the
            brands driving next-generation mining infrastructure.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {brands.map((brand) => (
            <motion.div
              key={brand.name}
              variants={itemVariants}
              className={cn(
                "group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden",
                "p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:bg-white/10 hover:shadow-[0_8px_30px_rgba(56,189,248,0.25)]"
              )}
            >
              <div className="flex justify-center items-center mb-6 h-14">
                {brand.logo}
              </div>
              <div className="font-semibold text-foreground text-lg">
                {brand.name}
              </div>
              <div className="mt-1 text-foreground/60 text-sm">
                {brand.subtitle}
              </div>
              <div className="bottom-0 absolute inset-x-6 bg-linear-to-r from-transparent via-accent/40 to-transparent opacity-0 group-hover:opacity-100 h-px transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
