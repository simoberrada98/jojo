import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import { H1, H2, H3, Muted, P } from '@/components/ui/typography';
import { ChevronRight, Truck, Globe, Clock, Shield } from 'lucide-react';

export default function ShippingPage() {
  return (
    <PageLayout>
      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="border-border border-b">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">
                Information — Shipping:
              </span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-linear-to-b from-card/50 to-background py-12 md:py-16">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
            <H1 className="mb-4">Information — Shipping:</H1>
            <div className="space-y-2 mx-auto max-w-xl text-muted-foreground text-lg">
              <P>
                Handling time: <strong>1–2 days</strong>
              </P>
              <P>
                Delivery time: <strong>2–4 days</strong>
              </P>
            </div>
            <Muted className="m-0 mx-auto max-w-2xl text-lg">
              Fast, secure, and reliable delivery of your mining hardware
              worldwide
            </Muted>
          </div>
        </section>

        {/* Shipping Options */}
        <section className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-7xl">
          <H2 className="mb-12">Shipping Options</H2>
          <div className="gap-8 grid grid-cols-1 md:grid-cols-2 mb-16">
            {[
              {
                name: 'Handling Time',
                time: '1-2 Business Days',
                cost: '$0',
                icon: Clock,
                description: 'Faster Order Proccessing',
              },
              {
                name: 'Standard Shipping',
                time: '2–4 Business Days',
                cost: 'Free on orders over $500',
                icon: Truck,
                description: 'Reliable ground shipping with full tracking',
              },
            ].map((option, index) => {
              const Icon = option.icon;
              return (
                <div
                  key={index}
                  className="bg-card p-8 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex justify-center items-center bg-accent/20 rounded-lg w-12 h-12">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <H3 className="text-lg">{option.name}</H3>
                      <Muted className="m-0 font-semibold text-accent text-sm">
                        {option.time}
                      </Muted>
                    </div>
                  </div>
                  <Muted className="m-0 mb-4">{option.description}</Muted>
                  <Muted className="m-0 font-semibold text-foreground text-lg">
                    {option.cost}
                  </Muted>
                </div>
              );
            })}
          </div>
        </section>

        {/* Packaging & Safety */}
        <section className="py-16 border-border border-y">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <H2 className="mb-12">Packaging & Safety</H2>
            <div className="gap-8 grid grid-cols-1 md:grid-cols-3">
              {[
                {
                  title: 'Professional Packaging',
                  description:
                    'All mining hardware is carefully packaged with protective materials to ensure safe delivery',
                },
                {
                  title: 'Insurance Included',
                  description:
                    'Every shipment includes full insurance coverage for the declared value of your order',
                },
                {
                  title: 'Real-time Tracking',
                  description:
                    'Track your package in real-time from warehouse to your doorstep',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-background p-6 border border-border rounded-lg"
                >
                  <H3 className="mb-3 text-lg">{item.title}</H3>
                  <Muted className="m-0">{item.description}</Muted>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Delivery Regions */}
        <section className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-7xl">
          <H2 className="mb-12">Delivery Regions</H2>
          <div className="gap-8 grid grid-cols-1 md:grid-cols-2">
            <div className="bg-card p-8 border border-border rounded-lg">
              <H3 className="mb-6 text-xl">Domestic Shipping</H3>
              <ul className="space-y-3">
                {['United States', 'Canada', 'Mexico'].map((region, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-muted-foreground"
                  >
                    <div className="bg-accent rounded-full w-2 h-2" />
                    {region}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card p-8 border border-border rounded-lg">
              <H3 className="mb-6 text-xl">International Shipping</H3>
              <ul className="space-y-3">
                {['Europe', 'Asia', 'Australia', 'Other Regions'].map(
                  (region, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-muted-foreground"
                    >
                      <div className="bg-accent rounded-full w-2 h-2" />
                      {region}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 border-border border-t">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <H2 className="mb-12">Frequently Asked Questions</H2>
            <div className="space-y-6">
              {[
                {
                  q: 'How long does shipping take?',
                  a: 'Shipping times vary by location and method. Standard shipping typically takes 7-10 business days within the US.',
                },
                {
                  q: 'Can I track my order?',
                  a: 'Yes! You will receive a tracking number via email once your order ships. You can track it in real-time.',
                },
                {
                  q: 'What if my package is damaged?',
                  a: 'All packages are insured. If damage occurs, contact us immediately with photos and we will arrange a replacement.',
                },
                {
                  q: 'Do you ship internationally?',
                  a: 'Yes, we ship to most countries worldwide. International shipping costs are calculated at checkout.',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-background p-6 border border-border rounded-lg"
                >
                  <H3 className="mb-3 text-lg">{item.q}</H3>
                  <Muted className="m-0">{item.a}</Muted>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
