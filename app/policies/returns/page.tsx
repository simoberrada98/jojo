import { P, H1, H2 } from '@/components/ui/typography';
import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jhuangnyc.com';
const canonicalUrl = `${baseUrl}/policies/returns`;
const LAST_UPDATED = 'Nov 2 2025';

export const metadata: Metadata = {
  title: 'Returns & Refunds | MineHub',
  description:
    'Return eligibility windows, inspection steps, and refund timelines for mining hardware orders.',
  alternates: {
    canonical: '/policies/returns',
  },
  openGraph: {
    type: 'article',
    url: canonicalUrl,
    title: 'Returns & Refunds',
    description:
      'Understand how to request a return, inspection requirements, and refund disbursement timing.',
  },
};

const returnWindows = [
  {
    item: 'Unused miners in original packaging',
    window: '7 days from delivery',
    notes: 'Subject to 10% restocking fee to cover import and handling.',
  },
  {
    item: 'Operational miners (powered and tested)',
    window: '14 days from delivery',
    notes:
      'Requires diagnostic logs and proof of issue. Shipping paid by customer.',
  },
  {
    item: 'Accessories, cables, and power distribution',
    window: '30 days from delivery',
    notes: 'Must be unopened to qualify for full refund.',
  },
];

const refundTimelines = [
  {
    step: 'Return requested',
    timeline: 'Within 1 business day',
    action: 'Receive RMA number and prepaid label if eligible.',
  },
  {
    step: 'Hardware received at warehouse',
    timeline: '2-3 business days',
    action: 'Inspection and hashboard testing completed.',
  },
  {
    step: 'Refund issued',
    timeline: '3-5 business days after inspection',
    action:
      'Funds returned to original payment method. Crypto refunds paid at USD spot rate at time of return.',
  },
];

export default function ReturnsPolicyPage() {
  return (
    <article className="bg-background text-foreground">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl">
        <header className="mb-10">
          <P className="text-accent text-xs uppercase tracking-widest">
            Policy
          </P>
          <H1 className="mt-3 font-semibold text-4xl md:text-5xl text-balance">
            Returns & Refunds Process
          </H1>
          <P className="mt-4 text-muted-foreground leading-relaxed">
            Follow these steps to request a return, understand inspection
            requirements, and track how refunds are released.
          </P>
          <div className="flex flex-wrap items-center gap-3 mt-4 text-muted-foreground text-sm">
            <span>Updated {LAST_UPDATED}</span>
            <span aria-hidden="true">|</span>
            <a
              href={`${canonicalUrl}#process`}
              className="text-accent hover:underline underline-offset-4"
            >
              Cite this page
            </a>
          </div>
        </header>

        <section
          id="process"
          aria-labelledby="process-heading"
          className="bg-card/40 border border-border rounded-2xl"
        >
          <div className="px-6 py-5 border-border border-b">
            <H2 id="process-heading" className="font-semibold text-2xl">
              Return workflow
            </H2>
            <P className="mt-2 text-muted-foreground text-sm">
              Request a Return Merchandise Authorization (RMA) before shipping
              hardware. Returns without an authorised RMA will be refused.
            </P>
          </div>
          <div className="overflow-x-auto">
            <table className="divide-y divide-border w-full text-sm text-left">
              <caption className="sr-only">
                Return windows and conditions for different hardware types
              </caption>
              <thead className="bg-accent/10 text-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Item
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Eligibility window
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background/70 divide-y divide-border">
                {returnWindows.map(({ item, window, notes }) => (
                  <tr key={item} className="align-top">
                    <th scope="row" className="px-4 py-3 font-medium">
                      {item}
                    </th>
                    <td className="px-4 py-3 text-foreground/80">{window}</td>
                    <td className="px-4 py-3 text-foreground/80">{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="exceptions"
          aria-labelledby="exceptions-heading"
          className="bg-card/40 mt-12 p-6 border border-border rounded-2xl"
        >
          <H2 id="exceptions-heading" className="font-semibold text-2xl">
            Exceptions & inspection notes
          </H2>
          <ul className="space-y-3 mt-4 pl-5 text-muted-foreground list-disc">
            <li>
              Hardware with missing serial stickers or tamper seals is
              ineligible.
            </li>
            <li>
              Custom firmware flashing must be reverted to stock prior to
              inspection.
            </li>
            <li>
              Consumables (thermal paste, filters) are non-returnable once
              opened.
            </li>
            <li>
              Hosting customers follow the onsite swap programme governed by the
              hosting SLA.
            </li>
          </ul>
        </section>

        <section
          id="timeline"
          aria-labelledby="timeline-heading"
          className="bg-card/40 mt-12 border border-border rounded-2xl"
        >
          <div className="px-6 py-5 border-border border-b">
            <H2 id="timeline-heading" className="font-semibold text-2xl">
              Refund timeline
            </H2>
            <P className="mt-2 text-muted-foreground text-sm">
              Expect the following cadence once your hardware is back in our
              facility.
            </P>
          </div>
          <div className="overflow-x-auto">
            <table className="divide-y divide-border w-full text-sm text-left">
              <caption className="sr-only">
                Refund process timeline with expected duration and actions
              </caption>
              <thead className="bg-accent/10 text-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Step
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Timeline
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Action taken
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background/70 divide-y divide-border">
                {refundTimelines.map(({ step, timeline, action }) => (
                  <tr key={step} className="align-top">
                    <th scope="row" className="px-4 py-3 font-medium">
                      {step}
                    </th>
                    <td className="px-4 py-3 text-foreground/80">{timeline}</td>
                    <td className="px-4 py-3 text-foreground/80">{action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="contact"
          className="bg-card/30 mt-12 p-6 border border-border border-dashed rounded-2xl text-muted-foreground text-sm"
        >
          <H2 className="font-semibold text-foreground text-2xl">
            Start a return
          </H2>
          <P className="mt-4">
            Email{' '}
            <a
              href="mailto:returns@jhuangnyc.com?subject=Return%20request&utm_source=policy&utm_medium=llm&utm_campaign=miner-returns"
              className="text-accent hover:underline underline-offset-4"
            >
              returns@jhuangnyc.com
            </a>{' '}
            with your order number, serials, photos, and a description of the
            issue. We will reply with shipping instructions and RMA paperwork.
          </P>
        </section>
      </div>
    </article>
  );
}
