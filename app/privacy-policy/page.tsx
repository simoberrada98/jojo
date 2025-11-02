import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { serializeSchema } from '@/lib/schema';
import { H1, P, H3 } from '@/components/ui/typography';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jhuangnyc.com';
const canonicalUrl = `${baseUrl}/privacy-policy`;
const ogImageUrl = `${baseUrl}/assets/images/Privacy.png`;
const lastUpdatedDisplay = 'October 15, 2024';
const lastUpdatedISO = '2024-10-15';
const description =
  'Understand how Jhuangnyc collects, uses, and protects your personal data when you shop for cryptocurrency mining hardware.';

export const metadata: Metadata = {
  title: 'Privacy Policy | Jhuangnyc',
  description,
  alternates: { canonical: '/privacy-policy' },
  openGraph: {
    title: 'Jhuangnyc Privacy Policy',
    description,
    url: canonicalUrl,
    type: 'article',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Illustration representing data protection for Jhuangnyc customers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jhuangnyc Privacy Policy',
    description,
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  const privacyPolicySchema = {
    '@context': 'https://schema.org',
    '@type': 'PrivacyPolicy',
    name: 'Jhuangnyc Privacy Policy',
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
          __html: serializeSchema(privacyPolicySchema),
        }}
      />

      <main className="pt-20">
        {/* Hero */}
        <section className="bg-background border-border border-b">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src="/assets/images/Privacy.png"
                alt="Abstract illustration representing privacy and data protection"
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
                  Privacy Policy
                </span>
              </div>
              <div className="mt-8 max-w-3xl">
                <H1 className="font-bold text-4xl sm:text-5xl">
                  Privacy Policy
                </H1>
                <P className="mt-4 text-muted-foreground text-lg">
                  Transparency, security, and trust are at the core of
                  everything we do. This policy explains how we collect, use,
                  and protect your data when you explore or purchase mining
                  hardware from Jhuangnyc.
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
                <CardTitle>At a Glance</CardTitle>
              </CardHeader>
              <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                <ul>
                  <li>
                    We only collect the information we need to process orders,
                    support customers, and improve our services.
                  </li>
                  <li>
                    We never sell personal data and only share it with trusted
                    partners who help us operate the business.
                  </li>
                  <li>
                    You stay in control: request access, updates, deletion, or
                    marketing preferences at any time.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="gap-6 grid md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Information We Collect</CardTitle>
                </CardHeader>
                <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                  <H3>Information you give us</H3>
                  <ul>
                    <li>Account details such as name, email, and password</li>
                    <li>Billing, shipping, and contact information</li>
                    <li>
                      Order history, support requests, and survey responses
                    </li>
                    <li>
                      Payment details processed securely by vetted third parties
                    </li>
                  </ul>
                  <H3 className="mt-4">Information we collect automatically</H3>
                  <ul>
                    <li>
                      Device and browser data, IP address, and approximate
                      location
                    </li>
                    <li>
                      Usage analytics, interaction logs, and referral URLs
                    </li>
                    <li>
                      Cookie identifiers, pixels, and similar technologies used
                      to remember your preferences
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How We Use Your Information</CardTitle>
                </CardHeader>
                <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                  <ul>
                    <li>
                      Process purchases, deliver products, and provide invoices
                    </li>
                    <li>Authenticate logins and safeguard accounts</li>
                    <li>Respond to support requests and warranty claims</li>
                    <li>Improve site performance, navigation, and security</li>
                    <li>
                      Send service updates, product announcements, and
                      promotions when you opt in
                    </li>
                    <li>
                      Meet legal, tax, and compliance obligations in the
                      jurisdictions where we operate
                    </li>
                  </ul>
                  <P className="mt-4">
                    Our legal bases for processing include performing a
                    contract, legitimate business interests, obtaining your
                    consent, and fulfilling legal requirements.
                  </P>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>How Payments Work</CardTitle>
              </CardHeader>
              <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                <P>
                  Checkout flows are handled end-to-end with Stripe, which
                  tokenizes sensitive cardholder data and shares only the last
                  four digits and expiration date with our team. This keeps the
                  app responsive while preventing us from ever storing full card
                  numbers on Jhuangnyc servers.
                </P>
                <ol className="space-y-2 pl-6 list-decimal">
                  <li>
                    Review your cart, shipping details, and taxes, then choose a
                    payment option supported by Stripe (major credit and debit
                    cards plus any alternative methods displayed at checkout).
                  </li>
                  <li>
                    Payment details are entered into Stripe-hosted fields inside
                    the app. Stripe instantly encrypts the information and
                    returns a secure token to our order system.
                  </li>
                  <li>
                    We authorize the payment to confirm funds, generate your
                    order confirmation, and email a detailed receipt. Large or
                    high-risk orders may trigger a manual review before we
                    capture funds.
                  </li>
                  <li>
                    Once the payment is captured, the order status updates in
                    your account dashboard and our fulfillment team prepares
                    shipment or pickup logistics.
                  </li>
                </ol>
                <P className="mt-4">
                  If Stripe declines or flags a payment, we will prompt you to
                  retry, switch to another method, or contact support for manual
                  assistance. You can request invoices, payment confirmations,
                  or account statements anytime by emailing{' '}
                  <a href="mailto:contact@jhuangnyc.com">
                    contact@jhuangnyc.com
                  </a>
                  .
                </P>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sharing & International Transfers</CardTitle>
              </CardHeader>
              <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                <P>
                  We only share personal data with vendors that enable core
                  operations such as payment processing, logistics, analytics,
                  and customer support. Each partner is bound by confidentiality
                  and data processing agreements.
                </P>
                <ul>
                  <li>
                    <strong>Service providers:</strong> Stripe, shipping
                    carriers, analytics platforms, and cloud infrastructure
                  </li>
                  <li>
                    <strong>Business transitions:</strong> If we sell or merge
                    part of the company, your information may transfer with the
                    business assets
                  </li>
                  <li>
                    <strong>Legal disclosures:</strong> When required to comply
                    with applicable laws, court orders, or to protect our rights
                  </li>
                </ul>
                <P className="mt-4">
                  Because we operate in the United States, your data may be
                  processed outside of your country. We implement safeguards
                  such as Standard Contractual Clauses and vendor due diligence
                  to protect international transfers.
                </P>
              </CardContent>
            </Card>

            <div className="gap-6 grid md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Data Retention & Security</CardTitle>
                </CardHeader>
                <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                  <P>
                    We keep personal information only for as long as needed to
                    deliver products, resolve disputes, comply with legal
                    obligations, and maintain business records.
                  </P>
                  <ul>
                    <li>
                      Encryption in transit and at rest for sensitive data
                    </li>
                    <li>Strict access controls and audit logging</li>
                    <li>Regular security assessments and vendor reviews</li>
                    <li>Employee training focused on privacy best practices</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cookies & Tracking Technologies</CardTitle>
                </CardHeader>
                <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                  <P>
                    We use cookies to remember your preferences, keep you signed
                    in, analyze traffic, and measure marketing performance.
                  </P>
                  <ul>
                    <li>
                      Essential cookies keep the store secure and functional
                    </li>
                    <li>
                      Analytics cookies help us understand how visitors use the
                      site
                    </li>
                    <li>
                      Marketing cookies personalize offers when you opt in
                    </li>
                  </ul>
                  <P className="mt-4">
                    You can manage cookies in your browser settings or through
                    our cookie banner. Disabling certain cookies may limit site
                    functionality.
                  </P>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Privacy Choices & Rights</CardTitle>
              </CardHeader>
              <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                <P>
                  Depending on where you live, you may have the right to access,
                  correct, delete, or restrict the processing of your personal
                  data. These rights include:
                </P>
                <ul>
                  <li>Requesting a copy of the data we hold about you</li>
                  <li>Updating inaccurate or incomplete information</li>
                  <li>Asking us to delete your account or order history</li>
                  <li>
                    Opting out of marketing emails and analytics where
                    applicable
                  </li>
                  <li>Objecting to processing based on legitimate interests</li>
                  <li>
                    Lodging a complaint with your local data protection
                    authority
                  </li>
                </ul>
                <P className="mt-4">
                  If you are located in the EEA, UK, or Switzerland, we process
                  personal data in alignment with GDPR requirements. California
                  residents can exercise rights under the CCPA, including
                  requesting information about data sharing and opting out of
                  sale or sharing (which we do not perform).
                </P>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact & Updates</CardTitle>
              </CardHeader>
              <CardContent className="dark:prose-invert max-w-none prose prose-sm">
                <P>
                  We review this policy regularly to reflect changes in our
                  services, legal obligations, or best practices. When we make
                  material updates, we will adjust the date above and share a
                  notice on our site.
                </P>
                <P className="mt-4">
                  Reach out anytime with questions or to exercise your privacy
                  rights:
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
                    Mailing address: 26 Laurel Ave, East Islip, NY 11730, United
                    States
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
