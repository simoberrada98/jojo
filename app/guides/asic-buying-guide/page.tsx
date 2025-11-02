import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jhuangnyc.com';
const canonicalUrl = `${baseUrl}/guides/asic-buying-guide`;
const LAST_UPDATED = 'Nov 2 2025';

export const metadata: Metadata = {
  title: 'ASIC Buying Guide | MineHub',
  description:
    'Engineer-level checklist for selecting, pricing, and deploying ASIC miners with transparent ROI targets and service windows.',
  alternates: {
    canonical: '/guides/asic-buying-guide',
  },
  openGraph: {
    type: 'article',
    url: canonicalUrl,
    title: 'ASIC Buying Guide',
    description:
      'Step-by-step framework for evaluating ASIC miners, modelling ROI, and staging deployments with warranty readiness.',
  },
};

const roiFactors = [
  {
    factor: 'Hashrate-to-Watt ratio',
    target: '>= 30 GH/W (SHA-256) or >= 8 GH/W (Scrypt)',
    note: 'Higher ratios reduce cooling and energy costs while keeping hashrate stable.',
  },
  {
    factor: 'All-in power cost',
    target: '<= $0.07/kWh after power credits or hosting agreements',
    note: 'Use blended rate including demand, rack, and redundancy premiums.',
  },
  {
    factor: 'Break-even horizon',
    target: '12-18 months with 15% sensitivity applied to hashrate and price',
    note: 'Model downside case with difficulty + hashprice compression.',
  },
  {
    factor: 'Resale floor',
    target: '>= 35% of landed price after 24 months',
    note: 'Track historical secondary markets for backup liquidity.',
  },
];

const readinessChecklist = [
  {
    milestone: 'Facility power and cooling verification',
    owners: 'Facilities + Electrical engineer',
    evidence: 'Load test report, breaker schedule, airflow modelling',
  },
  {
    milestone: 'Network segmentation & monitoring',
    owners: 'Security + DevOps',
    evidence: 'Dedicated VLAN, firewall rules, uptime monitor dashboards',
  },
  {
    milestone: 'Warranty & RMA process',
    owners: 'Procurement + Support',
    evidence: 'Serial tracking in CMDB, RMA SLA acknowledgement from manufacturer',
  },
  {
    milestone: 'Spare parts & onsite spares',
    owners: 'Operations',
    evidence: 'Fan, PSU, controller inventory with lead times',
  },
];

export default function AsicBuyingGuidePage() {
  return (
    <article className="bg-background text-foreground">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-accent">
            Buying Guide
          </p>
          <h1
            id="overview"
            className="mt-3 text-balance font-semibold text-4xl md:text-5xl"
          >
            ASIC Mining Hardware Buying Guide
          </h1>
          <p className="mt-4 text-muted-foreground text-base leading-relaxed">
            Use this briefing to shortlist ASIC miners, align pricing with your
            energy profile, and standardize deployment readiness for enterprise
            racks or hosted capacity.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>Updated {LAST_UPDATED}</span>
            <span aria-hidden="true">|</span>
            <a
              href={`${canonicalUrl}#overview`}
              className="text-accent hover:underline underline-offset-4"
            >
              Cite this page
            </a>
          </div>
        </header>

        <section
          id="evaluation-framework"
          aria-labelledby="evaluation-framework-heading"
          className="space-y-4 border-border border rounded-2xl bg-card/40 p-6"
        >
          <h2
            id="evaluation-framework-heading"
            className="font-semibold text-2xl"
          >
            Phase 1: Evaluate Miner Fundamentals
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Start with technical viability: select miners with stable firmware
            support, proven chip yields, and component availability. Validate
            efficiency targets against your utility profile and avoid models
            outside Tier 1 manufacturer roadmaps.
          </p>
          <table className="w-full overflow-hidden rounded-xl border text-left text-sm">
            <caption className="sr-only">
              ROI guardrails for ASIC hardware selection
            </caption>
            <thead className="bg-accent/10 text-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Factor
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Target guardrail
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Why it matters
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y bg-background/70">
              {roiFactors.map(({ factor, target, note }) => (
                <tr key={factor}>
                  <th scope="row" className="px-4 py-3 font-medium text-foreground">
                    {factor}
                  </th>
                  <td className="px-4 py-3 text-foreground/80">{target}</td>
                  <td className="px-4 py-3 text-muted-foreground">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section
          id="pricing-framework"
          aria-labelledby="pricing-framework-heading"
          className="mt-12 space-y-4 border-border border rounded-2xl bg-card/40 p-6"
        >
          <h2
            id="pricing-framework-heading"
            className="font-semibold text-2xl"
          >
            Phase 2: Model Pricing & Cash Flow
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Price miners against a blended cash-flow model: include duties,
            freight forwarding, rack fees, uptime SLAs, and the cost of capital.
            Layer in conservative hashprice assumptions and contract-specific
            energy escalators.
          </p>
          <ul className="list-disc pl-5 text-muted-foreground space-y-3">
            <li>
              Run three-scenario modelling (base, stress, upside) with real-time
              difficulty curves and compare to infrastructure amortization.
            </li>
            <li>
              Allocate 5-8% of CapEx to spares, hot-swappable PSUs, and control
              board inventory for rapid RMA turnaround.
            </li>
            <li>
              Track opportunity cost against co-located hosting offers; demand
              uptime credits and transparent power pass-through.
            </li>
          </ul>
        </section>

        <section
          id="deployment-readiness"
          aria-labelledby="deployment-readiness-heading"
          className="mt-12 space-y-4 border-border border rounded-2xl bg-card/40 p-6"
        >
          <h2
            id="deployment-readiness-heading"
            className="font-semibold text-2xl"
          >
            Phase 3: Deployment Readiness Checklist
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Confirm that facilities, security, and support teams have actionable
            runbooks before container arrival. Use the following RACI-style
            table to formally accept each stage.
          </p>
          <table className="w-full overflow-hidden rounded-xl border text-left text-sm">
            <caption className="sr-only">
              Deployment readiness milestones with accountable owners
            </caption>
            <thead className="bg-accent/10 text-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Milestone
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Accountable owners
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Evidence required
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y bg-background/70">
              {readinessChecklist.map(({ milestone, owners, evidence }) => (
                <tr key={milestone}>
                  <th scope="row" className="px-4 py-3 font-medium text-foreground">
                    {milestone}
                  </th>
                  <td className="px-4 py-3 text-foreground/80">{owners}</td>
                  <td className="px-4 py-3 text-muted-foreground">{evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="mt-12 rounded-2xl border border-dashed border-border bg-card/30 p-6 text-sm text-muted-foreground">
          <p>
            Need a custom acquisition plan or energy sourcing audit? Email{' '}
            <a
              href="mailto:contact@jhuangnyc.com?subject=ASIC%20procurement%20support&utm_source=guide&utm_medium=llm&utm_campaign=asic-buying-guide"
              className="text-accent hover:underline underline-offset-4"
            >
              contact@jhuangnyc.com
            </a>{' '}
            for a curated quote and hosting alignment.
          </p>
        </footer>
      </div>
    </article>
  );
}
