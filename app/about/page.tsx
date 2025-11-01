import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { H1, H2, H3, P } from '@/components/ui/typography';
import { Shield, Zap, Users, Award } from 'lucide-react';
import { serializeSchema } from '@/lib/schema';

export default function AboutPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jhuangnyc.com';

  // LocalBusiness schema for the about page
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/about`,
    name: 'Jhuangnyc',
    description:
      'Your trusted partner in cryptocurrency mining hardware since 2020. We provide high-quality ASIC miners from leading manufacturers, backed by exceptional customer service and competitive pricing.',
    url: baseUrl,
    foundingDate: '2020',
    image: `${baseUrl}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '26 Laurel Ave',
      addressLocality: 'East Islip',
      addressRegion: 'NY',
      postalCode: '11730',
      addressCountry: 'US',
    },
    telephone: '+1-631-224-3534',
    email: 'contact@jhuangnyc.com',
    priceRange: '$$$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '00:00',
        closes: '23:59',
      },
    ],
    sameAs: ['https://twitter.com/jhuangnyc', 'https://github.com/jhuangnyc'],
  };

  return (
    <PageLayout>
      {/* Schema.org LocalBusiness markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeSchema(localBusinessSchema),
        }}
      />
      <div className="mx-auto px-4 py-12 container">
        {/* Hero Section */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <H1 className="mb-4">About Jhuangnyc</H1>
          <P className="m-0 text-muted-foreground text-xl">
            Your trusted partner in cryptocurrency mining hardware since 2020
          </P>
        </div>

        {/* Mission Section */}
        <div className="mx-auto mb-16 max-w-4xl">
          <Card>
            <CardContent className="pt-6">
              <H2 className="mb-4">Our Mission</H2>
              <P className="m-0 text-muted-foreground text-lg">
                At Jhuangnyc, we&rsquo;re dedicated to making cryptocurrency
                mining accessible to everyone. We provide high-quality ASIC
                miners from leading manufacturers, backed by exceptional
                customer service and competitive pricing. Our goal is to empower
                miners of all sizes to participate in blockchain networks and
                contribute to the decentralization of cryptocurrency.
              </P>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mx-auto mb-16 max-w-6xl">
          <H2 className="mb-8 text-center">Our Values</H2>
          <div className="gap-6 grid md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex justify-center items-center bg-primary/10 mb-4 rounded-full w-12 h-12">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <H3 className="mb-2 font-semibold text-lg">
                    Trust & Transparency
                  </H3>
                  <P className="m-0 text-muted-foreground text-sm">
                    We build lasting relationships through honest communication
                    and reliable service.
                  </P>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex justify-center items-center bg-primary/10 mb-4 rounded-full w-12 h-12">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <H3 className="mb-2 font-semibold text-lg">Innovation</H3>
                  <P className="m-0 text-muted-foreground text-sm">
                    We stay ahead of the curve, offering the latest mining
                    technology and solutions.
                  </P>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex justify-center items-center bg-primary/10 mb-4 rounded-full w-12 h-12">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <H3 className="mb-2 font-semibold text-lg">Customer First</H3>
                  <P className="m-0 text-muted-foreground text-sm">
                    Your success is our success. We provide dedicated support
                    every step of the way.
                  </P>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex justify-center items-center bg-primary/10 mb-4 rounded-full w-12 h-12">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <H3 className="mb-2 font-semibold text-lg">
                    Quality Assurance
                  </H3>
                  <P className="m-0 text-muted-foreground text-sm">
                    We partner with top manufacturers to ensure you receive
                    authentic, high-performance equipment.
                  </P>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Story Section */}
        <div className="mx-auto mb-16 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Our Story</CardTitle>
            </CardHeader>
            <CardContent className="dark:prose-invert max-w-none prose prose-sm">
              <p>
                Founded in 2020 by a team of cryptocurrency enthusiasts and
                hardware experts, Jhuangnyc was born from a simple observation:
                miners needed a reliable, transparent source for quality mining
                equipment.
              </p>
              <p>
                What started as a small operation has grown into a trusted name
                in the cryptocurrency mining community. We&rsquo;ve helped
                thousands of miners—from hobbyists setting up their first rig to
                large-scale operations managing hundreds of machines.
              </p>
              <p>
                Today, we continue to evolve with the industry, adding new
                products, improving our services, and staying committed to our
                founding principles of quality, transparency, and customer
                satisfaction.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What We Offer Section */}
        <div className="mx-auto mb-16 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>What We Offer</CardTitle>
            </CardHeader>
            <CardContent className="dark:prose-invert max-w-none prose prose-sm">
              <ul>
                <li>
                  <strong>Premium ASIC Miners:</strong> Latest models from
                  Bitmain, MicroBT, and other leading manufacturers
                </li>
                <li>
                  <strong>Competitive Pricing:</strong> Direct partnerships
                  ensure the best value for your investment
                </li>
                <li>
                  <strong>Fast Shipping:</strong> Quick delivery with tracking
                  and insurance
                </li>
                <li>
                  <strong>Expert Support:</strong> Knowledgeable team ready to
                  assist with setup and troubleshooting
                </li>
                <li>
                  <strong>Warranty Support:</strong> We help facilitate
                  manufacturer warranties and RMA processes
                </li>
                <li>
                  <strong>Educational Resources:</strong> Guides and tips to
                  optimize your mining operation
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <div className="mx-auto mb-16 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Our Team</CardTitle>
            </CardHeader>
            <CardContent className="dark:prose-invert max-w-none prose prose-sm">
              <p>
                Our team combines deep expertise in cryptocurrency, hardware
                engineering, and customer service. We&rsquo;re passionate miners
                ourselves, which means we understand the challenges and
                opportunities you face.
              </p>
              <p>
                Every member of our team is dedicated to providing the best
                possible experience, from helping you choose the right equipment
                to supporting you long after your purchase.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Community Section */}
        <div className="mx-auto mb-16 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Join Our Community</CardTitle>
            </CardHeader>
            <CardContent className="dark:prose-invert max-w-none prose prose-sm">
              <p>
                Jhuangnyc is more than just a store—we&rsquo;re a community of
                miners supporting each other&rsquo;s success. Stay connected
                with us:
              </p>
              <ul>
                <li>
                  Subscribe to our newsletter for industry news and exclusive
                  offers
                </li>
                <li>Follow us on social media for tips and updates</li>
                <li>Join our Discord server to connect with other miners</li>
                <li>
                  Check our blog for mining guides and profitability analyses
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mx-auto max-w-4xl text-center">
          <Card className="bg-linear-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6 pb-6">
              <H2 className="mb-4">Ready to Start Mining?</H2>
              <P className="m-0 mb-6 text-muted-foreground">
                Browse our selection of miners or contact our team for
                personalized recommendations.
              </P>
              <div className="flex sm:flex-row flex-col justify-center gap-4">
                <Link
                  href="/collection"
                  className="inline-flex justify-center items-center bg-primary hover:bg-primary/90 px-6 py-3 rounded-md text-primary-foreground transition"
                >
                  Shop Miners
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex justify-center items-center hover:bg-primary/10 px-6 py-3 border border-primary rounded-md text-primary transition"
                >
                  Contact Us
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
