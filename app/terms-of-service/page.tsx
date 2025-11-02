import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { serializeSchema } from '@/lib/schema';
import { H1, P } from '@/components/ui/typography';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jhuangnyc.com';
const canonicalUrl = `${baseUrl}/terms-of-service`;
const ogImageUrl = `${baseUrl}/assets/images/Terms.png`;
const lastUpdatedDisplay = 'October 15, 2024';
const lastUpdatedISO = '2024-10-15';
const description =
  'Review the Jhuangnyc Terms of Service to understand your responsibilities, order policies, and legal rights when purchasing cryptocurrency mining hardware.';

export const metadata: Metadata = {
  title: 'Terms of Service | Jhuangnyc',
  description,
  alternates: { canonical: '/terms-of-service' },
  openGraph: {
    title: 'Jhuangnyc Terms of Service',
    description,
    url: canonicalUrl,
    type: 'article',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Graphic depicting contractual agreement and handshake for Jhuangnyc terms',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jhuangnyc Terms of Service',
    description,
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  const termsSchema = {
    '@context': 'https://schema.org',
    '@type': 'TermsOfService',
    name: 'Jhuangnyc Terms of Service',
    url: canonicalUrl,
    dateModified: lastUpdatedISO,
    inLanguage: 'en-US',
    description,
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
    mainEntityOfPage: canonicalUrl,
  };

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeSchema(termsSchema),
        }}
      />

      <main className="pt-20">
        {/* Hero */}
        <section className="bg-background border-border border-b">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src="/assets/images/Terms.png"
                alt="Graphic illustrating legal agreement and contract review"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-background/80 backdrop-blur" />
            </div>
            <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors"
                >
                  Home
                </Link>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
                <span className="font-medium text-foreground">
                  Terms of Service
                </span>
              </div>
              <div className="mt-8 max-w-3xl">
                <H1 className="font-bold text-4xl sm:text-5xl">
                  Terms of Service
                </H1>
                <P className="mt-4 text-muted-foreground text-lg">
                  These terms outline how you can access, purchase from, and
                  interact with Jhuangnyc. Please read them carefully so you
                  understand your obligations and our commitments before placing
                  an order.
                </P>
                <P className="mt-6 text-muted-foreground">
                  Last updated:{' '}
                  <time dateTime={lastUpdatedISO}>{lastUpdatedDisplay}</time>
                </P>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl">
          <div className="space-y-10">
            <Card>
              <CardHeader>
                <CardTitle>Key Takeaways</CardTitle>
              </CardHeader>
              <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                <ul>
                  <li>
                    Using our site means you accept these terms and agree to
                    comply with applicable laws.
                  </li>
                  <li>
                    Orders are subject to availability, verification, and our
                    fraud-prevention checks.
                  </li>
                  <li>
                    Cryptocurrency mining involves inherent risks; hardware
                    performance and profitability are not guaranteed.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="gap-6 grid md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your Account Responsibilities</CardTitle>
                </CardHeader>
                <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                  <ul>
                    <li>
                      Provide accurate, current, and complete registration
                      details.
                    </li>
                    <li>
                      Maintain the confidentiality of login credentials and
                      notify us of any unauthorized use.
                    </li>
                    <li>
                      Ensure you meet the minimum age and legal requirements in
                      your jurisdiction.
                    </li>
                    <li>
                      Accept liability for all activity conducted through your
                      account.
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Orders, Payments & Verification</CardTitle>
                </CardHeader>
                <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                  <ul>
                    <li>
                      Prices are quoted in USD and may change without prior
                      notice.
                    </li>
                    <li>
                      We authorize payment methods at checkout and capture funds
                      when an order is confirmed.
                    </li>
                    <li>
                      Taxes, duties, and import fees are the customer’s
                      responsibility unless otherwise noted.
                    </li>
                    <li>
                      Orders may be declined or cancelled if suspicious activity
                      or pricing errors are detected.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Products, Availability & Accuracy</CardTitle>
              </CardHeader>
              <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                <P>
                  We strive to present accurate product specifications, lead
                  times, and pricing. However, mining hardware can change
                  rapidly as manufacturers issue updates. Specifications, hash
                  rates, and efficiencies may vary from the published
                  information, and availability is not guaranteed until an order
                  is accepted.
                </P>
                <P className="mt-4">
                  We reserve the right to limit quantities, substitute
                  equivalent models, or discontinue items at our discretion. If
                  a material change affects your order, we will contact you with
                  available options or provide a refund.
                </P>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping, Delivery & Risk of Loss</CardTitle>
              </CardHeader>
              <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                <ul>
                  <li>
                    Shipping estimates are provided during checkout and may vary
                    due to carrier constraints or customs clearance.
                  </li>
                  <li>
                    Risk of loss transfers to you once the carrier confirms
                    delivery to the address provided at checkout.
                  </li>
                  <li>
                    Inspect packages on arrival and report shipping damage or
                    shortages within 48 hours so we can file carrier claims.
                  </li>
                  <li>
                    For international deliveries, you authorize us to designate
                    carriers and customs brokers on your behalf.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acceptable Use & Restrictions</CardTitle>
              </CardHeader>
              <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                <P>
                  You agree not to misuse the site or any products purchased
                  from us. Prohibited conduct includes:
                </P>
                <ul>
                  <li>
                    Violating applicable laws or export regulations, including
                    sanctions programs.
                  </li>
                  <li>
                    Attempting to gain unauthorized access to our systems or
                    other customer accounts.
                  </li>
                  <li>
                    Uploading malicious code, interfering with site performance,
                    or engaging in fraudulent mining schemes.
                  </li>
                  <li>
                    Infringing the intellectual property rights of Jhuangnyc or
                    third parties.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="gap-6 grid md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Disclosure & Warranties</CardTitle>
                </CardHeader>
                <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                  <P>
                    Cryptocurrency mining carries operational and financial
                    risks, including hardware failure, network difficulty
                    changes, and price volatility. Jhuangnyc provides hardware
                    “as is” with no implied warranty of profitability or uptime.
                    Manufacturer warranties, when available, are passed through
                    to you and may require direct coordination with the
                    supplier.
                  </P>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Limitation of Liability</CardTitle>
                </CardHeader>
                <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                  <P>
                    To the fullest extent permitted by law, Jhuangnyc and its
                    affiliates are not liable for indirect, incidental, special,
                    consequential, or punitive damages, including lost profits,
                    revenue, or data. Aggregate liability for claims relating to
                    a purchase will not exceed the amount you paid for the
                    product giving rise to the claim.
                  </P>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Indemnification</CardTitle>
              </CardHeader>
              <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                <P>
                  You agree to defend, indemnify, and hold harmless Jhuangnyc,
                  its officers, employees, and partners from any claims,
                  damages, losses, or expenses (including reasonable attorney
                  fees) arising out of your breach of these terms, misuse of the
                  site, or violation of any law or third-party rights.
                </P>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Governing Law & Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                <P>
                  These terms are governed by the laws of the State of New York,
                  United States, without regard to conflict-of-law rules. You
                  agree to submit to the exclusive jurisdiction of the state and
                  federal courts located in Suffolk County, New York, for any
                  dispute that is not subject to informal resolution or binding
                  arbitration agreed upon by the parties.
                </P>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Changes & Contact</CardTitle>
              </CardHeader>
              <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                <P>
                  We may update these Terms of Service to reflect changes in our
                  products, legal requirements, or operational practices. When
                  material updates occur, we will adjust the “Last updated” date
                  and may provide additional notice on our site. Continued use
                  of the services after changes take effect constitutes
                  acceptance of the revised terms.
                </P>
                <P className="mt-4">
                  Questions about these terms? Our support team is ready to
                  help:
                </P>
                <ul>
                  <li>
                    Email:{' '}
                    <a href="mailto:contact@jhuangnyc.com">
                      contact@jhuangnyc.com
                    </a>
                  </li>
                  <li>Phone: +1-631-224-3534</li>
                  <li>
                    Mail: 26 Laurel Ave, East Islip, NY 11730, United States
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
