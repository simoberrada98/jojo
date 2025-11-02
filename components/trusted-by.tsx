'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useAnimationConfig } from '@/lib/animation';
import type { BezierDefinition } from 'framer-motion';

import { cn } from '@/lib/utils';

type Brand = {
  name: string;
  subtitle: string;
  logoSrc: string;
};

import AmvLogo from '@/public/svgs/amv.svg';
import CoinBaseLogo from '@/public/svgs/coinbase.svg';
import NVIDIALogo from '@/public/svgs/nvidia.svg';
import TrustPilotLogo from '@/public/svgs/trust-pilot.svg';
import MiningNowLogo from '@/public/svgs/miningnow.svg';
import { H2, P } from './ui/typography';

const brands: Brand[] = [
  {
    name: 'AMV',
    subtitle: 'ASIC Innovators',
    logoSrc: AmvLogo,
  },

  {
    name: 'NVIDIA',
    subtitle: 'GPU Performance',
    logoSrc: NVIDIALogo,
  },
  {
    name: 'TrustPilot',
    subtitle: 'Trusted Users',
    logoSrc: TrustPilotLogo,
  },
  {
    name: 'MiniNow',
    subtitle: 'Server-Grade Reliability',
    logoSrc: MiningNowLogo,
  },
  {
    name: 'Coinbase',
    subtitle: 'Global Exchange Partner',
    logoSrc: CoinBaseLogo,
  },
];

const makeMarquee = (duration: number) => ({
  animate: {
    x: ['0%', '-50%'],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: 'loop' as const,
        duration,
        ease: 'linear' as const,
      },
    },
  },
});

export default function TrustedBySection() {
  const reducedMotion = useReducedMotion();
  const anim = useAnimationConfig();
  const duplicatedBrands = [...brands, ...brands];

  return (
    <section className="relative py-20 sm:py-24">
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-br from-background via-background/55 to-background/50 backdrop-blur-md pointer-events-none"
      />
      <div className="relative mx-auto px-6 max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 mb-4 px-4 py-1 border border-accent/40 rounded-full font-semibold text-accent text-sm uppercase tracking-wide">
            Trusted By
          </div>
          <H2 className="font-tech font-semibold text-foreground text-3xl sm:text-4xl tracking-tight">
            Partnered with industry-leading innovators
          </H2>
          <P className="mt-4 text-foreground/70 text-base sm:text-lg">
            From silicon design to global exchanges, we work alongside the
            brands driving next-generation mining infrastructure.
          </P>
        </div>

        <div className="relative overflow-hidden">
          <motion.div
            className="flex items-center gap-10 py-4 min-w-max will-change-transform"
            variants={makeMarquee(anim.marqueeDuration)}
            animate={reducedMotion ? undefined : 'animate'}
          >
            {duplicatedBrands.map((brand, index) => (
              <div
                key={`${brand.name}-${index}`}
                className={cn(
                  'group flex justify-center items-center px-8 h-16 shrink-0',
                  'transition-opacity duration-300'
                )}
              >
                <Image
                  src={brand.logoSrc}
                  alt={`${brand.name} logo`}
                  width={160}
                  height={56}
                  className="opacity-90 group-hover:opacity-100 w-auto h-10 object-contain transition-opacity duration-300"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
