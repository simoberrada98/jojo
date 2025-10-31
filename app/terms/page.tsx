import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agreement to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                By accessing and using Jhuangnyc, you agree to be bound by these
                Terms of Service and all applicable laws and regulations. If you
                do not agree with any of these terms, you are prohibited from
                using this site.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Use License</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Permission is granted to temporarily access the materials on
                Jhuangnyc for personal, non-commercial transitory viewing only.
                This is the grant of a license, not a transfer of title, and
                under this license you may not:
              </p>
              <ul>
                <li>Modify or copy the materials</li>
                <li>
                  Use the materials for any commercial purpose or for any public
                  display
                </li>
                <li>
                  Attempt to decompile or reverse engineer any software
                  contained on the website
                </li>
                <li>
                  Remove any copyright or other proprietary notations from the
                  materials
                </li>
                <li>
                  Transfer the materials to another person or "mirror" the
                  materials on any other server
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Registration</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                To access certain features, you may need to create an account.
                You agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Information & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                We strive to provide accurate product descriptions and pricing.
                However:
              </p>
              <ul>
                <li>
                  We do not warrant that product descriptions or other content
                  is accurate, complete, or error-free
                </li>
                <li>Prices are subject to change without notice</li>
                <li>
                  We reserve the right to limit quantities or refuse service
                </li>
                <li>Product availability may vary</li>
                <li>
                  Cryptocurrency mining hardware specifications may vary by
                  manufacturer
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders and Payment</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>By placing an order, you:</p>
              <ul>
                <li>
                  Agree to pay all charges at the prices in effect when you
                  place your order
                </li>
                <li>Authorize us to charge your payment method</li>
                <li>
                  Accept responsibility for any customs fees, duties, or taxes
                </li>
                <li>Understand that order acceptance is at our discretion</li>
              </ul>
              <p className="mt-4">
                We reserve the right to refuse or cancel orders for any reason,
                including but not limited to product availability, pricing
                errors, or suspected fraud.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping and Delivery</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Shipping times are estimates and not guaranteed. We are not
                responsible for delays caused by customs, weather, or carrier
                issues. Risk of loss passes to you upon delivery to the carrier.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Returns and Refunds</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Our return policy is outlined in our Returns & Refunds page.
                Please review it carefully before making a purchase. Mining
                hardware may have specific return restrictions due to their
                nature.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>You may not use our site:</p>
              <ul>
                <li>For any unlawful purpose</li>
                <li>To solicit others to perform unlawful acts</li>
                <li>
                  To violate any international, federal, or state regulations
                </li>
                <li>To infringe upon our intellectual property rights</li>
                <li>To harass, abuse, or harm another person</li>
                <li>To transmit viruses or malicious code</li>
                <li>To engage in price manipulation or market abuse</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                All content on this website, including text, graphics, logos,
                images, and software, is the property of Jhuangnyc or its content
                suppliers and is protected by copyright and trademark laws.
                Unauthorized use may violate these laws.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disclaimer of Warranties</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                The materials on Jhuangnyc are provided on an 'as is' basis. We
                make no warranties, expressed or implied, and hereby disclaim
                all other warranties including, without limitation, implied
                warranties of merchantability, fitness for a particular purpose,
                or non-infringement.
              </p>
              <p className="mt-4 font-semibold">
                Cryptocurrency mining involves risks including but not limited
                to: hardware failure, electricity costs, mining difficulty
                changes, and cryptocurrency value volatility. We make no
                guarantees about mining profitability.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                In no event shall Jhuangnyc or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use the materials on our website.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Indemnification</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                You agree to indemnify and hold harmless Jhuangnyc and its
                affiliates from any claims, damages, or expenses arising from
                your use of our services or violation of these terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                These terms shall be governed by and construed in accordance
                with the laws of New York, United States, without regard to its
                conflict of law provisions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                We reserve the right to modify these terms at any time. Your
                continued use of the website following any changes constitutes
                acceptance of those changes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>For questions about these Terms of Service, contact us at:</p>
              <ul>
                <li>Email: contact@jhuangnyc.com</li>
                <li>Address: 26 Laurel Ave, East Islip, NY 11730, US</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
