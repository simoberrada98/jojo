import Link from "next/link"
import PageLayout from "@/components/layout/PageLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { H1, H2, H3, P } from "@/components/ui/typography"
import { Shield, Zap, Users, Award } from "lucide-react"
import { serializeSchema } from "@/lib/schema"

export default function AboutPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://jhuangnyc.com"
  
  // LocalBusiness schema for the about page
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/about`,
    name: "Jhuangnyc",
    description: "Your trusted partner in cryptocurrency mining hardware since 2020. We provide high-quality ASIC miners from leading manufacturers, backed by exceptional customer service and competitive pricing.",
    url: baseUrl,
    foundingDate: "2020",
    image: `${baseUrl}/logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "26 Laurel Ave",
      addressLocality: "East Islip",
      addressRegion: "NY",
      postalCode: "11730",
      addressCountry: "US",
    },
    telephone: "+1-631-224-3534",
    email: "contact@jhuangnyc.com",
    priceRange: "$$$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    sameAs: [
      "https://twitter.com/jhuangnyc",
      "https://github.com/jhuangnyc",
    ],
  }

  return (
    <PageLayout>
      {/* Schema.org LocalBusiness markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeSchema(localBusinessSchema),
        }}
      />
      <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto mb-16 text-center">
        <H1 className="mb-4">About Jhuangnyc</H1>
        <P className="text-xl text-muted-foreground m-0">
          Your trusted partner in cryptocurrency mining hardware since 2020
        </P>
      </div>

      {/* Mission Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <Card>
          <CardContent className="pt-6">
            <H2 className="mb-4">Our Mission</H2>
            <P className="text-lg text-muted-foreground m-0">
              At Jhuangnyc, we're dedicated to making cryptocurrency mining accessible to everyone. We provide high-quality ASIC miners from leading manufacturers, backed by exceptional customer service and competitive pricing. Our goal is to empower miners of all sizes to participate in blockchain networks and contribute to the decentralization of cryptocurrency.
            </P>
          </CardContent>
        </Card>
      </div>

      {/* Values Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <H2 className="mb-8 text-center">Our Values</H2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <H3 className="font-semibold text-lg mb-2">Trust & Transparency</H3>
                <P className="text-sm text-muted-foreground m-0">
                  We build lasting relationships through honest communication and reliable service.
                </P>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <H3 className="font-semibold text-lg mb-2">Innovation</H3>
                <P className="text-sm text-muted-foreground m-0">
                  We stay ahead of the curve, offering the latest mining technology and solutions.
                </P>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <H3 className="font-semibold text-lg mb-2">Customer First</H3>
                <P className="text-sm text-muted-foreground m-0">
                  Your success is our success. We provide dedicated support every step of the way.
                </P>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <H3 className="font-semibold text-lg mb-2">Quality Assurance</H3>
                <P className="text-sm text-muted-foreground m-0">
                  We partner with top manufacturers to ensure you receive authentic, high-performance equipment.
                </P>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <Card>
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Founded in 2020 by a team of cryptocurrency enthusiasts and hardware experts, Jhuangnyc was born from a simple observation: miners needed a reliable, transparent source for quality mining equipment.
            </p>
            <p>
              What started as a small operation has grown into a trusted name in the cryptocurrency mining community. We've helped thousands of miners—from hobbyists setting up their first rig to large-scale operations managing hundreds of machines.
            </p>
            <p>
              Today, we continue to evolve with the industry, adding new products, improving our services, and staying committed to our founding principles of quality, transparency, and customer satisfaction.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* What We Offer Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <Card>
          <CardHeader>
            <CardTitle>What We Offer</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <ul>
              <li><strong>Premium ASIC Miners:</strong> Latest models from Bitmain, MicroBT, and other leading manufacturers</li>
              <li><strong>Competitive Pricing:</strong> Direct partnerships ensure the best value for your investment</li>
              <li><strong>Fast Shipping:</strong> Quick delivery with tracking and insurance</li>
              <li><strong>Expert Support:</strong> Knowledgeable team ready to assist with setup and troubleshooting</li>
              <li><strong>Warranty Support:</strong> We help facilitate manufacturer warranties and RMA processes</li>
              <li><strong>Educational Resources:</strong> Guides and tips to optimize your mining operation</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Team Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <Card>
          <CardHeader>
            <CardTitle>Our Team</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Our team combines deep expertise in cryptocurrency, hardware engineering, and customer service. We're passionate miners ourselves, which means we understand the challenges and opportunities you face.
            </p>
            <p>
              Every member of our team is dedicated to providing the best possible experience, from helping you choose the right equipment to supporting you long after your purchase.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Community Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <Card>
          <CardHeader>
            <CardTitle>Join Our Community</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Jhuangnyc is more than just a store—we're a community of miners supporting each other's success. Stay connected with us:
            </p>
            <ul>
              <li>Subscribe to our newsletter for industry news and exclusive offers</li>
              <li>Follow us on social media for tips and updates</li>
              <li>Join our Discord server to connect with other miners</li>
              <li>Check our blog for mining guides and profitability analyses</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto text-center">
        <Card className="bg-linear-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6 pb-6">
            <H2 className="mb-4">Ready to Start Mining?</H2>
            <P className="text-muted-foreground mb-6 m-0">
              Browse our selection of miners or contact our team for personalized recommendations.
            </P>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/collection"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
              >
                Shop Miners
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-md hover:bg-primary/10 transition"
              >
                Contact Us
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageLayout>
  )
}
