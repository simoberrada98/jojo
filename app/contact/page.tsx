"use client"

import type React from "react"

import { useState } from "react"
import PageLayout from "@/components/layout/PageLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { H1, H2, H3, Muted } from "@/components/ui/typography"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" })
      setSubmitted(false)
    }, 3000)
  }

  return (
    <PageLayout>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-linear-to-b from-card/50 to-background py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <H1 className="mb-4">Get in Touch</H1>
            <Muted className="text-lg max-w-2xl mx-auto">
              Have questions about our mining hardware? Our team is here to help you find the perfect solution.
            </Muted>
          </div>
        </section>

        {/* Contact Info & Form */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Contact Info Cards */}
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <H3 className="text-lg">Email</H3>
              </div>
              <Muted className="mb-2 text-base">contact@jhuangnyc.com</Muted>
              <Muted>We'll respond within 24 hours</Muted>
            </div>

            <div className="bg-card border border-border rounded-lg p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-accent" />
                </div>
                <H3 className="text-lg">Phone</H3>
              </div>
              <Muted className="mb-2 text-base">+1 (631) 224-3534</Muted>
              <Muted>Mon-Fri, 9AM-6PM EST</Muted>
            </div>

            <div className="bg-card border border-border rounded-lg p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <H3 className="text-lg">Address</H3>
              </div>
              <Muted className="mb-2 text-base">26 Laurel Ave</Muted>
              <Muted>East Islip, NY 11730, US</Muted>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-8 md:p-12">
            <H2 className="mb-8">Send us a Message</H2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select name="subject" value={formData.subject} onValueChange={(value) => handleChange({ target: { name: 'subject', value } } as any)} required>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product-inquiry">Product Inquiry</SelectItem>
                      <SelectItem value="technical-support">Technical Support</SelectItem>
                      <SelectItem value="bulk-order">Bulk Order</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Tell us how we can help..."
                    className="resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>

                {submitted && (
                  <div className="p-4 bg-success/20 border border-success rounded-lg">
                    <Muted className="text-success m-0">
                      Thank you! Your message has been sent successfully.
                    </Muted>
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* Business Hours */}
        <section className=" border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-6">
              <Clock className="w-6 h-6 text-accent" />
              <H3 className="text-xl m-0">Business Hours</H3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM EST" },
                { day: "Saturday", hours: "10:00 AM - 4:00 PM EST" },
                { day: "Sunday", hours: "Closed" },
                { day: "Holidays", hours: "Closed" },
              ].map((item, index) => (
                <div key={index} className="bg-background border border-border rounded-lg p-4">
                  <Muted className="font-medium text-foreground m-0">{item.day}</Muted>
                  <Muted className="m-0">{item.hours}</Muted>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
