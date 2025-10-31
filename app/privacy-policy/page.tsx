import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { ChevronRight } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <PageLayout>
      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="border-border border-b">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-4xl">
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">
                Privacy Policy
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <section className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
          <h1 className="mb-2 font-bold text-foreground text-4xl">
            Privacy Policy
          </h1>
          <p className="mb-8 text-muted-foreground">
            Last updated: October 2024
          </p>

          <div className="space-y-8 prose-invert max-w-none prose">
            <section>
              <h2 className="mb-4 font-bold text-foreground text-2xl">
                1. Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Jhuangnyc ("we," "us," "our," or "Company") operates the
                website. This page informs you of our policies regarding the
                collection, use, and disclosure of personal data when you use
                our Service and the choices you have associated with that data.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-bold text-foreground text-2xl">
                2. Information Collection and Use
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We collect several different types of information for various
                purposes to provide and improve our Service to you.
              </p>
              <h3 className="mb-3 font-semibold text-foreground text-lg">
                Types of Data Collected:
              </h3>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                <li>
                  Personal Data: Name, email address, phone number, shipping
                  address, payment information
                </li>
                <li>
                  Usage Data: Browser type, IP address, pages visited, time and
                  date of visits
                </li>
                <li>
                  Cookies and Tracking: We use cookies to track activity on our
                  Service
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 font-bold text-foreground text-2xl">
                3. Use of Data
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Jhuangnyc uses the collected data for various purposes:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>
                  To allow you to participate in interactive features of our
                  Service
                </li>
                <li>To provide customer support</li>
                <li>
                  To gather analysis or valuable information so we can improve
                  our Service
                </li>
                <li>To monitor the usage of our Service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 font-bold text-foreground text-2xl">
                4. Security of Data
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The security of your data is important to us but remember that
                no method of transmission over the Internet or method of
                electronic storage is 100% secure. While we strive to use
                commercially acceptable means to protect your Personal Data, we
                cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-bold text-foreground text-2xl">
                5. Changes to This Privacy Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date at the top of
                this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-bold text-foreground text-2xl">
                6. Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <div className="bg-card mt-4 p-4 border border-border rounded-lg">
                <p className="text-foreground">Email: contact@jhuangnyc.com</p>
                <p className="text-foreground">
                  Address: 26 Laurel Ave, East Islip, NY 11730, US
                </p>
              </div>
            </section>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
