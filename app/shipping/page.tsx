import Link from "next/link"
import PageLayout from "@/components/layout/PageLayout"
import { ChevronRight, Truck, Globe, Clock, Shield } from "lucide-react"

export default function ShippingPage() {
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
              <span className="text-foreground font-medium">Shipping Information</span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-b from-card/50 to-background py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Shipping Information</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fast, secure, and reliable delivery of your mining hardware worldwide
            </p>
          </div>
        </section>

        {/* Shipping Options */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-foreground mb-12">Shipping Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {[
              {
                name: "Standard Shipping",
                time: "7-10 Business Days",
                cost: "Free on orders over $500",
                icon: Truck,
                description: "Reliable ground shipping with full tracking",
              },
              {
                name: "Express Shipping",
                time: "3-5 Business Days",
                cost: "$49.99",
                icon: Clock,
                description: "Faster delivery with priority handling",
              },
              {
                name: "Overnight Shipping",
                time: "1 Business Day",
                cost: "$149.99",
                icon: Globe,
                description: "Next-day delivery for urgent orders",
              },
              {
                name: "International Shipping",
                time: "10-21 Business Days",
                cost: "Calculated at checkout",
                icon: Shield,
                description: "Worldwide delivery with customs support",
              },
            ].map((option, index) => {
              const Icon = option.icon
              return (
                <div key={index} className="bg-card border border-border rounded-lg p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{option.name}</h3>
                      <p className="text-sm text-accent font-semibold">{option.time}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{option.description}</p>
                  <p className="text-lg font-semibold text-foreground">{option.cost}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Packaging & Safety */}
        <section className="bg-card/50 border-y border-border py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-12">Packaging & Safety</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Professional Packaging",
                  description:
                    "All mining hardware is carefully packaged with protective materials to ensure safe delivery",
                },
                {
                  title: "Insurance Included",
                  description: "Every shipment includes full insurance coverage for the declared value of your order",
                },
                {
                  title: "Real-time Tracking",
                  description: "Track your package in real-time from warehouse to your doorstep",
                },
              ].map((item, index) => (
                <div key={index} className="bg-background border border-border rounded-lg p-6">
                  <h3 className="text-lg font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Delivery Regions */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-foreground mb-12">Delivery Regions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Domestic Shipping</h3>
              <ul className="space-y-3">
                {["United States", "Canada", "Mexico"].map((region, index) => (
                  <li key={index} className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    {region}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">International Shipping</h3>
              <ul className="space-y-3">
                {["Europe", "Asia", "Australia", "Other Regions"].map((region, index) => (
                  <li key={index} className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    {region}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-card/50 border-t border-border py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                {
                  q: "How long does shipping take?",
                  a: "Shipping times vary by location and method. Standard shipping typically takes 7-10 business days within the US.",
                },
                {
                  q: "Can I track my order?",
                  a: "Yes! You will receive a tracking number via email once your order ships. You can track it in real-time.",
                },
                {
                  q: "What if my package is damaged?",
                  a: "All packages are insured. If damage occurs, contact us immediately with photos and we will arrange a replacement.",
                },
                {
                  q: "Do you ship internationally?",
                  a: "Yes, we ship to most countries worldwide. International shipping costs are calculated at checkout.",
                },
              ].map((item, index) => (
                <div key={index} className="bg-background border border-border rounded-lg p-6">
                  <h3 className="text-lg font-bold text-foreground mb-3">{item.q}</h3>
                  <p className="text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
