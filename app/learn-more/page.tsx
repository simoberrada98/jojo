import Link from 'next/link';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { H1, H2, Muted, P } from '@/components/ui/typography';
import { serializeSchema } from '@/lib/schema';
import {
  Rocket,
  ShieldCheck,
  Headphones,
  Gauge,
  Wrench,
  Wallet,
  ChevronRight,
  Cpu,
} from 'lucide-react';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jhuangnyc.com';
const canonicalUrl = `${baseUrl}/learn-more`;
const ogImageUrl = `${baseUrl}/assets/images/Contact%20and%20About.png`;
const description =
  'Discover how Jhuangnyc helps you evaluate, purchase, and maintain professional mining hardware with expert guidance every step of the way.';

export const metadata: Metadata = {
  title: 'Learn More | Jhuangnyc Mining Hardware',
  description,
  alternates: { canonical: '/learn-more' },
  openGraph: {
    title: 'Learn More About Jhuangnyc',
    description,
    url: canonicalUrl,
    type: 'article',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Jhuangnyc team supporting cryptocurrency miners',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn More About Jhuangnyc',
    description,
    images: [ogImageUrl],
  },
};

export default function LearnMorePage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Learn More About Jhuangnyc',
    description,
    url: canonicalUrl,
    mainEntity: [
      {
        '@type': 'ItemList',
        name: 'Why miners choose Jhuangnyc',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Expert-curated ASIC hardware',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Transparent pricing and bundled services',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Launch support and ongoing optimization',
          },
        ],
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Jhuangnyc',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        email: 'contact@jhuangnyc.com',
        telephone: '+1-631-224-3534',
      },
    },
  };

  const learnCards = [
    {
      icon: Rocket,
      title: 'Ready-to-Mine Hardware',
      description:
        'We vet every model for sustained profitability, energy efficiency, and manufacturer reliability before it ever reaches our catalog.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Purchasing',
      description:
        'Stripe-powered checkout, documented warranty support, and insured shipping protect your investment from cart to rack.',
    },
    {
      icon: Headphones,
      title: 'Specialist Support',
      description:
        'Talk with miners who operate rigs daily. We help you select, configure, and scale with best practices tailored to your goals.',
    },
    {
      icon: Gauge,
      title: 'Performance Insights',
      description:
        'Profitability dashboards, firmware guidance, and tuning resources keep hash rates high and downtime low.',
    },
  ];

  const steps = [
    {
      title: 'Explore Proven Miners',
      copy: 'Browse top ASIC models with up-to-date hashrate, power draw, and ROI projections sourced from live market data.',
    },
    {
      title: 'Lock In Transparent Pricing',
      copy: 'Pay securely via Stripe or bank transfer. Taxes, duties, and shipping insurance are clearly documented at checkout.',
    },
    {
      title: 'Deploy With Confidence',
      copy: 'Receive hardware in protective packaging, access setup guides, and schedule a launch call with our technicians.',
    },
    {
      title: 'Scale & Optimize',
      copy: 'Tap into firmware tuning, hosting referrals, and upgrade paths to grow your operation on your timeline.',
    },
  ];

  const serviceHighlights = [
    {
      icon: Cpu,
      title: 'Configuration Guides',
      text: 'Step-by-step documentation for pool selection, network configuration, monitoring, and maintenance routines.',
    },
    {
      icon: Wrench,
      title: 'Warranty & RMA Help',
      text: 'We liaise with manufacturers to minimize downtime and coordinate replacements when issues arise.',
    },
    {
      icon: Wallet,
      title: 'Flexible Financing',
      text: 'Discuss custom terms, escrow needs, or multi-order discounts with our sales team to match your cash flow.',
    },
  ];

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeSchema(schema) }}
      />
      <main className="pt-20">
        <div className="border-border border-b bg-background/80 backdrop-blur">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-5 max-w-6xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
              <span className="font-medium text-foreground">Learn More</span>
            </div>
          </div>
        </div>

        <section className="bg-linear-to-b from-card/70 via-background to-background py-16 md:py-24 border-border border-b">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl text-center">
            <H1 className="mb-4">Everything You Need to Start Mining</H1>
            <P className="m-0 mx-auto max-w-3xl text-muted-foreground text-lg">
              Whether you are expanding an industrial farm or plugging in your
              first ASIC, Jhuangnyc delivers vetted hardware, transparent
              pricing, and expert support built for serious miners.
            </P>
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <Link
                href="/collection"
                className="inline-flex justify-center items-center bg-primary hover:bg-primary/90 px-6 py-3 rounded-full text-primary-foreground transition"
              >
                View Miners
              </Link>
              <Link
                href="/contact"
                className="inline-flex justify-center items-center border border-primary/40 hover:border-primary px-6 py-3 rounded-full text-primary transition"
              >
                Talk With Sales
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-6xl">
          <H2 className="mb-10 text-center">Why Miners Choose Jhuangnyc</H2>
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
            {learnCards.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="bg-card/80 border-border">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="flex justify-center items-center bg-accent/20 rounded-2xl w-12 h-12">
                    <Icon className="w-6 h-6 text-accent" aria-hidden="true" />
                  </div>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Muted className="m-0">{description}</Muted>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-border border-y bg-muted/10 py-16">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <H2 className="mb-10 text-center">How Our Process Works</H2>
            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
              {steps.map((step, index) => (
                <Card key={step.title} className="border-border">
                  <CardHeader>
                    <Muted className="m-0 font-semibold text-accent">
                      Step {index + 1}
                    </Muted>
                    <CardTitle>{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <P className="m-0 text-muted-foreground">{step.copy}</P>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-6xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <H2 className="mb-4">Support Beyond the Sale</H2>
            <P className="m-0 text-muted-foreground text-lg">
              Mining profitability depends on uptime. Our specialists help you
              stay online and scale smarter with resources tailored to your
              environment.
            </P>
          </div>
          <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
            {serviceHighlights.map(({ icon: Icon, title, text }) => (
              <Card key={title} className="border-border">
                <CardHeader className="flex flex-col items-start gap-3">
                  <div className="flex justify-center items-center bg-primary/10 rounded-xl w-11 h-11">
                    <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Muted className="m-0">{text}</Muted>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-border border-t bg-linear-to-br from-primary/5 via-background to-background py-16">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
            <H2 className="mb-4">Let&apos;s Build Your Mining Roadmap</H2>
            <P className="m-0 mb-8 text-muted-foreground text-lg">
              Share your objectives, power availability, and timeline. We will
              craft a tailored hardware plan and deliver a transparent quote
              within 48 hours.
            </P>
            <Link
              href="/contact"
              className="inline-flex justify-center items-center bg-accent hover:bg-accent/90 px-8 py-3 rounded-full text-background transition"
            >
              Schedule a Consultation
            </Link>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
