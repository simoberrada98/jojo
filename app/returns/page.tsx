import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H1, Muted } from "@/components/ui/typography";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default function ReturnsPage() {
  return (
    <PageLayout>
      <div className="mx-auto px-4 py-12 max-w-4xl container">
        <div className="mb-8">
          <H1 className="mb-2">Returns & Refunds Policy</H1>
          <Muted className="m-0">
            Last updated: {new Date().toLocaleDateString()}
          </Muted>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Return Window</CardTitle>
            </CardHeader>
            <CardContent className="dark:prose-invert max-w-none prose prose-sm">
              <p>
                We offer a <strong>14-day return window</strong> from the date
                of delivery for most products. Mining hardware must be returned
                in original, unopened condition to be eligible for a full
                refund.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Eligible for Return
              </CardTitle>
            </CardHeader>
            <CardContent className="dark:prose-invert max-w-none prose prose-sm">
              <ul>
                <li>Unopened mining hardware in original packaging</li>
                <li>Defective or damaged items (report within 48 hours)</li>
                <li>Wrong item shipped</li>
                <li>Items that differ significantly from description</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-destructive" />
                Not Eligible for Return
              </CardTitle>
            </CardHeader>
            <CardContent className="dark:prose-invert max-w-none prose prose-sm">
              <ul>
                <li>Opened or used mining hardware</li>
                <li>Items returned after 14 days</li>
                <li>Damaged due to misuse or improper installation</li>
                <li>Items missing original packaging or accessories</li>
                <li>Custom or special order items</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Initiate a Return</CardTitle>
            </CardHeader>
            <CardContent className="dark:prose-invert max-w-none prose prose-sm">
              <ol>
                <li>Contact our support team at contact@jhuangnyc.com</li>
                <li>Provide your order number and reason for return</li>
                <li>Wait for return authorization (RMA) number</li>
                <li>Package item securely with all original materials</li>
                <li>Ship to the address provided in your RMA email</li>
              </ol>
              <div className="flex gap-3 bg-amber-50 dark:bg-amber-950 mt-4 p-4 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertCircle className="mt-0.5 w-5 h-5 text-amber-600 shrink-0" />
                <Muted className="m-0 text-sm">
                  <strong>Important:</strong> Returns without an RMA number will
                  be refused. Please do not ship items back without
                  authorization.
                </Muted>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Refund Process</CardTitle>
            </CardHeader>
            <CardContent className="dark:prose-invert max-w-none prose prose-sm">
              <p>Once we receive and inspect your return:</p>
              <ul>
                <li>Refunds are processed within 5-7 business days</li>
                <li>Original payment method will be credited</li>
                <li>
                  Shipping costs are non-refundable (except for defective items)
                </li>
                <li>Restocking fee of 15% may apply to opened items</li>
              </ul>
              <p className="mt-4">
                You will receive an email confirmation once your refund has been
                processed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Defective or Damaged Items</CardTitle>
            </CardHeader>
            <CardContent className="dark:prose-invert max-w-none prose prose-sm">
              <p>
                If you receive a defective or damaged item, please contact us
                immediately with photos of the damage. We will:
              </p>
              <ul>
                <li>Provide a prepaid return label</li>
                <li>Offer a replacement or full refund</li>
                <li>Cover all return shipping costs</li>
              </ul>
              <p className="mt-4 font-semibold">
                Report damage within 48 hours of delivery for fastest
                resolution.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exchanges</CardTitle>
            </CardHeader>
            <CardContent className="dark:prose-invert max-w-none prose prose-sm">
              <p>
                We do not offer direct exchanges. If you need a different item,
                please return the original for a refund and place a new order.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Warranty Claims</CardTitle>
            </CardHeader>
            <CardContent className="dark:prose-invert max-w-none prose prose-sm">
              <p>
                Most mining hardware comes with manufacturer warranty. For
                warranty claims:
              </p>
              <ul>
                <li>Contact the manufacturer directly for support</li>
                <li>Provide proof of purchase and warranty information</li>
                <li>Follow manufacturer's RMA process</li>
              </ul>
              <p className="mt-4">
                We can assist in facilitating warranty claims if needed. Contact
                our support team for assistance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>International Returns</CardTitle>
            </CardHeader>
            <CardContent className="dark:prose-invert max-w-none prose prose-sm">
              <p>
                International customers are responsible for return shipping
                costs and any customs fees. We recommend using a trackable
                shipping method with insurance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="dark:prose-invert max-w-none prose prose-sm">
              <p>For questions about returns or refunds:</p>
              <ul>
                <li>Email: contact@jhuangnyc.com</li>
                <li>Phone: +1 (631) 224-3534</li>
                <li>Business Hours: Monday-Friday, 9 AM - 5 PM EST</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
