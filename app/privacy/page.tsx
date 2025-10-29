import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              MineHub ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <h3 className="font-semibold mt-4">Personal Information</h3>
            <p>We may collect personal information that you provide to us, including:</p>
            <ul>
              <li>Name and contact information (email, phone number, address)</li>
              <li>Account credentials (username, password)</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Order history and preferences</li>
            </ul>

            <h3 className="font-semibold mt-4">Automatically Collected Information</h3>
            <ul>
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Usage data and analytics</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>We use the collected information for:</p>
            <ul>
              <li>Processing and fulfilling your orders</li>
              <li>Managing your account and preferences</li>
              <li>Communicating with you about orders, products, and services</li>
              <li>Improving our website and services</li>
              <li>Marketing and promotional purposes (with your consent)</li>
              <li>Preventing fraud and enhancing security</li>
              <li>Complying with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information Sharing</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Third-party vendors who assist in operations (payment processing, shipping, analytics)</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>With Your Consent:</strong> When you authorize us to share information</li>
            </ul>
            <p className="mt-4">We do not sell your personal information to third parties.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security assessments</li>
              <li>Employee training on data protection</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent where applicable</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at privacy@minehub.com
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              We use cookies and similar technologies to enhance your experience. You can control cookies through your browser settings. Note that disabling cookies may affect website functionality.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <ul>
              <li>Email: privacy@minehub.com</li>
              <li>Address: [Your Business Address]</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
