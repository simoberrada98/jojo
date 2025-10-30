import Link from "next/link"
import PageLayout from "@/components/layout/PageLayout"
import { ChevronRight } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <PageLayout>

      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-card/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">Privacy Policy</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: October 2024</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                MineHub ("we," "us," "our," or "Company") operates the website. This page informs you of our policies
                regarding the collection, use, and disclosure of personal data when you use our Service and the choices
                you have associated with that data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Information Collection and Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect several different types of information for various purposes to provide and improve our
                Service to you.
              </p>
              <h3 className="text-lg font-semibold text-foreground mb-3">Types of Data Collected:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Personal Data: Name, email address, phone number, shipping address, payment information</li>
                <li>Usage Data: Browser type, IP address, pages visited, time and date of visits</li>
                <li>Cookies and Tracking: We use cookies to track activity on our Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Use of Data</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                MineHub uses the collected data for various purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features of our Service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information so we can improve our Service</li>
                <li>To monitor the usage of our Service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Security of Data</h2>
              <p className="text-muted-foreground leading-relaxed">
                The security of your data is important to us but remember that no method of transmission over the
                Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable
                means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                <p className="text-foreground">Email: privacy@minehub.com</p>
                <p className="text-foreground">Address: 123 Tech Street, San Francisco, CA 94105</p>
              </div>
            </section>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
