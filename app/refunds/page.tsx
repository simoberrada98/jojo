import Link from "next/link"
import PageLayout from "@/components/layout/PageLayout"
import { H1, H2, H3, Muted } from "@/components/ui/typography"
import { ChevronRight, RotateCcw, Clock, CheckCircle } from "lucide-react"

export default function RefundsPage() {
  return (
    <PageLayout>

      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">Refunds & Returns</span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-b from-card/50 to-background py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <H1 className="mb-4">Refunds & Returns Policy</H1>
            <Muted className="text-lg max-w-2xl mx-auto m-0">
              We stand behind our products. If you're not satisfied, we'll make it right.
            </Muted>
          </div>
        </section>

        {/* Return Policy */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Clock,
                title: "30-Day Return Window",
                description: "Return items within 30 days of purchase for a full refund",
              },
              {
                icon: RotateCcw,
                title: "Easy Returns Process",
                description: "Simple return process with prepaid shipping labels",
              },
              {
                icon: CheckCircle,
                title: "Full Refund Guarantee",
                description: "Get your money back if you're not satisfied",
              },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="bg-card border border-border rounded-lg p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                  <H3 className="text-lg mb-3">{item.title}</H3>
                  <Muted className="m-0">{item.description}</Muted>
                </div>
              )
            })}
          </div>
        </section>

        {/* Return Conditions */}
        <section className="bg-card/50 border-y border-border py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <H2 className="mb-8">Return Conditions</H2>
            <div className="space-y-6">
              <div className="bg-background border border-border rounded-lg p-6">
                <H3 className="text-lg mb-3">Eligible for Return</H3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-accent mt-1">✓</span>
                    <span>Items returned within 30 days of purchase</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent mt-1">✓</span>
                    <span>Products in original, unused condition</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent mt-1">✓</span>
                    <span>All original packaging and accessories included</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent mt-1">✓</span>
                    <span>Proof of purchase (order number or receipt)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-background border border-border rounded-lg p-6">
                <H3 className="text-lg mb-3">Not Eligible for Return</H3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-destructive mt-1">✕</span>
                    <span>Items returned after 30 days</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive mt-1">✕</span>
                    <span>Products showing signs of use or damage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive mt-1">✕</span>
                    <span>Items missing original packaging or accessories</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive mt-1">✕</span>
                    <span>Custom or special order items</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Return Process */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <H2 className="mb-12">How to Return an Item</H2>
          <div className="space-y-6">
            {[
              {
                step: 1,
                title: "Contact Support",
                description: "Email contact@jhuangnyc.com with your order number and reason for return",
              },
              {
                step: 2,
                title: "Receive Return Label",
                description: "We'll send you a prepaid return shipping label via email",
              },
              {
                step: 3,
                title: "Ship Your Item",
                description: "Pack the item securely and ship it using the provided label",
              },
              {
                step: 4,
                title: "Receive Refund",
                description: "Once received and inspected, your refund will be processed within 5-7 business days",
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-accent text-accent-foreground font-bold">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <H3 className="text-lg mb-2">{item.title}</H3>
                  <Muted className="m-0">{item.description}</Muted>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Refund Timeline */}
        <section className="bg-card/50 border-t border-border py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <H2 className="mb-8">Refund Timeline</H2>
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-foreground font-medium">Item Received</span>
                  <span className="text-accent">Day 1</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-foreground font-medium">Inspection & Verification</span>
                  <span className="text-accent">Days 2-3</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-foreground font-medium">Refund Processing</span>
                  <span className="text-accent">Days 4-7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">Refund Appears in Account</span>
                  <span className="text-accent">Days 7-10</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <H2 className="mb-4">Questions About Returns?</H2>
            <Muted className="mb-6 m-0">Our customer support team is here to help. Contact us anytime.</Muted>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:contact@jhuangnyc.com" className="text-accent hover:text-accent/80 font-medium">
                contact@jhuangnyc.com
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="tel:+16312243534" className="text-accent hover:text-accent/80 font-medium">
                +1 (631) 224-3534
              </a>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
