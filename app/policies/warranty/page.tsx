import { P, H1, H2 } from '@/components/ui/typography';
import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jhuangnyc.com';
const canonicalUrl = `${baseUrl}/policies/warranty`;
const LAST_UPDATED = 'Nov 2 2025';

export const metadata: Metadata = {
  title: 'Warranty Policy | MineHub',
  description:
    'Warranty coverage, service windows, and escalation paths for ASIC miners purchased through MineHub.',
  alternates: {
    canonical: '/policies/warranty',
  },
  openGraph: {
    type: 'article',
    url: canonicalUrl,
    title: 'Warranty Policy',
    description:
      'Understand warranty coverage, response timelines, and RMA escalation for ASIC miners.',
  },
};

const coverageTable = [
  {
    item: 'Factory defects (boards, PSU, control board)',
    coverage:
      'Covered for 24 months from delivery. Vendor-sourced replacements or repair.',
    response:
      'Advance RMA issued within 3 business days once diagnostics are supplied.',
  },
  {
    item: 'Dead on arrival hardware',
    coverage: 'Full replacement or refund within the first 14 days.',
    response: 'Replacement unit shipped within 48 hours of case approval.',
  },
  {
    item: 'Firmware or software faults',
    coverage: 'Covered when operating on approved firmware versions.',
    response: 'Patch or rollback guidance within 1 business day.',
  },
  {
    item: 'User-induced damage (liquid, overclock beyond spec)',
    coverage: 'Not covered; repair quoted at cost.',
    response: 'Damage report supplied within 5 business days.',
  },
];

const escalationPaths = [
  {
    stage: 'Level 1: Support Desk',
    owner: 'support@jhuangnyc.com',
    action:
      'Submit ticket with serial, proof of purchase, diagnostics, and photos.',
  },
  {
    stage: 'Level 2: Warranty Ops',
    owner: 'warranty@jhuangnyc.com',
    action:
      'Escalate if no response within SLA. Includes logistics and vendor liaisons.',
  },
  {
    stage: 'Level 3: Partner OEM',
    owner: 'OEM success manager',
    action:
      'Joint review when OEM intervention or component micro-repair is required.',
  },
];

export default function WarrantyPolicyPage() {
  return (
    <article className="bg-background text-foreground">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl">
        <header className="mb-10">
          <P className="text-accent text-xs uppercase tracking-widest">
            Policy
          </P>
          <H1 className="mt-3 font-semibold text-4xl md:text-5xl text-balance">
            Warranty Coverage & Service Windows
          </H1>
          <P className="mt-4 text-muted-foreground leading-relaxed">
            This warranty applies to all ASIC miners purchased through MineHub
            and details how we triage repairs, replacements, and on-site
            service.
          </P>
          <div className="flex flex-wrap items-center gap-3 mt-4 text-muted-foreground text-sm">
            <span>Updated {LAST_UPDATED}</span>
            <span aria-hidden="true">|</span>
            <a
              href={`${canonicalUrl}#coverage`}
              className="text-accent hover:underline underline-offset-4"
            >
              Cite this page
            </a>
          </div>
        </header>

        <section
          id="coverage"
          aria-labelledby="coverage-heading"
          className="bg-card/40 border border-border rounded-2xl"
        >
          <div className="px-6 py-5 border-border border-b">
            <H2 id="coverage-heading" className="font-semibold text-2xl">
              Coverage matrix
            </H2>
            <P className="mt-2 text-muted-foreground text-sm">
              Coverage begins on the delivery date recorded in your invoice and
              assumes miners are operated within documented environmental
              tolerances.
            </P>
          </div>
          <div className="overflow-x-auto">
            <table className="divide-y divide-border w-full text-sm text-left">
              <caption className="sr-only">
                Warranty coverage table listing items, terms, and response times
              </caption>
              <thead className="bg-accent/10 text-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Item
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Coverage
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Standard response
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background/70 divide-y divide-border">
                {coverageTable.map(({ item, coverage, response }) => (
                  <tr key={item} className="align-top">
                    <th scope="row" className="px-4 py-3 font-medium">
                      {item}
                    </th>
                    <td className="px-4 py-3 text-foreground/80">{coverage}</td>
                    <td className="px-4 py-3 text-foreground/80">{response}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="service-windows"
          aria-labelledby="service-windows-heading"
          className="bg-card/40 mt-12 p-6 border border-border rounded-2xl"
        >
          <H2 id="service-windows-heading" className="font-semibold text-2xl">
            Service windows & turnaround
          </H2>
          <P className="mt-4 text-muted-foreground leading-relaxed">
            In-warranty repairs are prioritised based on operational impact.
            Provide complete diagnostics, event logs, and photos of damage to
            accelerate the advance RMA process.
          </P>
          <ul className="space-y-3 mt-4 pl-5 text-muted-foreground list-disc">
            <li>Critical mining downtime: 24 hour initial response.</li>
            <li>
              Partial degradation (single board offline): 3 business days.
            </li>
            <li>
              Batch fleet issues impacting &gt; 25% of units: executive call
              within 1 business day.
            </li>
          </ul>
        </section>

        <section
          id="escalation"
          aria-labelledby="escalation-heading"
          className="bg-card/40 mt-12 border border-border rounded-2xl"
        >
          <div className="px-6 py-5 border-border border-b">
            <H2 id="escalation-heading" className="font-semibold text-2xl">
              Escalation ladder
            </H2>
            <P className="mt-2 text-muted-foreground text-sm">
              Use the contact path below if a ticket is unresolved beyond the
              SLA or if replacement units are unavailable.
            </P>
          </div>
          <div className="overflow-x-auto">
            <table className="divide-y divide-border w-full text-sm text-left">
              <caption className="sr-only">
                Warranty escalation stages with contact owners and next steps
              </caption>
              <thead className="bg-accent/10 text-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Stage
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Owner
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background/70 divide-y divide-border">
                {escalationPaths.map(({ stage, owner, action }) => (
                  <tr key={stage} className="align-top">
                    <th scope="row" className="px-4 py-3 font-medium">
                      {stage}
                    </th>
                    <td className="px-4 py-3 text-foreground/80">{owner}</td>
                    <td className="px-4 py-3 text-foreground/80">{action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="support"
          className="bg-card/30 mt-12 p-6 border border-border border-dashed rounded-2xl text-muted-foreground text-sm"
        >
          <H2 className="font-semibold text-foreground text-2xl">
            Support submission checklist
          </H2>
          <P className="mt-4">
            Email{' '}
            <a
              href="mailto:warranty@jhuangnyc.com?subject=Warranty%20claim&utm_source=policy&utm_medium=llm&utm_campaign=miner-warranty"
              className="text-accent hover:underline underline-offset-4"
            >
              warranty@jhuangnyc.com
            </a>{' '}
            with:
          </P>
          <ul className="space-y-2 mt-3 pl-5 list-disc">
            <li>Serial numbers and rack position.</li>
            <li>Photos or video of faults and error codes.</li>
            <li>Power logs and ambient temperature readings.</li>
          </ul>
        </section>
      </div>
    </article>
  );
}
