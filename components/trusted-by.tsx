"use client";

import type { ReactElement } from "react";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type Brand = {
  name: string;
  subtitle: string;
  logo: ReactElement;
};

import BitmainLogo from "@/public/svgs/bitmain.svg";
import MicroBTLogo from "@/public/svgs/microbt.svg";
import NVIDIALogo from "@/public/svgs/nvidia.svg";
import AMDLogo from "@/public/svgs/amd.svg";
import IntelLogo from "@/public/svgs/intel.svg";
import CoinbaseLogo from "@/public/svgs/coinbase.svg";

const brands: Brand[] = [
  {
    name: "Bitmain",
    subtitle: "ASIC Innovators",
    logo: <BitmainLogo />,
  },
  {
    name: "MicroBT",
    subtitle: "WhatsMiner Specialists",
    logo: <MicroBTLogo />,
  },
  {
    name: "NVIDIA",
    subtitle: "GPU Performance",
    logo: <NVIDIALogo />,
  },
  {
    name: "AMD",
    subtitle: "Efficient Hashing",
    logo: <AMDLogo />,
  },
  {
    name: "Intel",
    subtitle: "Server-Grade Reliability",
    logo: <IntelLogo />,
  },
  {
    name: "Coinbase",
    subtitle: "Global Exchange Partner",
    logo: <CoinbaseLogo />,
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
