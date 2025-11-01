import Link from 'next/link'
import PageLayout from '@/components/layout/PageLayout'
import { H1, H2, H3, Muted } from '@/components/ui/typography'
import { ChevronRight, RotateCcw, Clock, CheckCircle } from 'lucide-react'

export default function RefundsPage() {
  return (
    <PageLayout>
      <main className='pt-20'>
        {/* Breadcrumb */}
        <div className='border-border border-b'>
          <div className='mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl'>
            <div className='flex items-center gap-2 text-sm'>
              <Link
                href='/'
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                Home
              </Link>
              <ChevronRight className='w-4 h-4 text-muted-foreground' />
              <span className='font-medium text-foreground'>
                Refunds & Returns
              </span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className='bg-linear-to-b from-card/50 to-background py-12 md:py-16'>
          <div className='mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center'>
            <H1 className='mb-4'>Refunds & Returns Policy</H1>
            <Muted className='m-0 mx-auto max-w-2xl text-lg'>
              We stand behind our products. If you&rsquo;re not satisfied, we&rsquo;ll make
              it right.
            </Muted>
          </div>
        </section>

        {/* Return Policy */}
        <section className='mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-7xl'>
          <div className='gap-8 grid grid-cols-1 md:grid-cols-3 mb-16'>
            {[
              {
                icon: Clock,
                title: '30-Day Return Window',
                description:
                  'Return items within 30 days of purchase for a full refund'
              },
              {
                icon: RotateCcw,
                title: 'Easy Returns Process',
                description:
                  'Simple return process with prepaid shipping labels'
              },
              {
                icon: CheckCircle,
                title: 'Full Refund Guarantee',
                description: "Get your money back if you&rsquo;re not satisfied"
              }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={index}
                  className='bg-card p-8 border border-border rounded-lg text-center'
                >
                  <div className='flex justify-center mb-4'>
                    <div className='flex justify-center items-center bg-accent/20 rounded-lg w-12 h-12'>
                      <Icon className='w-6 h-6 text-accent' />
                    </div>
                  </div>
                  <H3 className='mb-3 text-lg'>{item.title}</H3>
                  <Muted className='m-0'>{item.description}</Muted>
                </div>
              )
            })}
          </div>
        </section>

        {/* Return Conditions */}
        <section className='py-16 border-border border-y'>
          <div className='mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl'>
            <H2 className='mb-8'>Return Conditions</H2>
            <div className='space-y-6'>
              <div className='bg-background p-6 border border-border rounded-lg'>
                <H3 className='mb-3 text-lg'>Eligible for Return</H3>
                <ul className='space-y-2 text-muted-foreground'>
                  <li className='flex items-start gap-3'>
                    <span className='mt-1 text-accent'>✓</span>
                    <span>Items returned within 30 days of purchase</span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <span className='mt-1 text-accent'>✓</span>
                    <span>Products in original, unused condition</span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <span className='mt-1 text-accent'>✓</span>
                    <span>All original packaging and accessories included</span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <span className='mt-1 text-accent'>✓</span>
                    <span>Proof of purchase (order number or receipt)</span>
                  </li>
                </ul>
              </div>

              <div className='bg-background p-6 border border-border rounded-lg'>
                <H3 className='mb-3 text-lg'>Not Eligible for Return</H3>
                <ul className='space-y-2 text-muted-foreground'>
                  <li className='flex items-start gap-3'>
                    <span className='mt-1 text-destructive'>✕</span>
                    <span>Items returned after 30 days</span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <span className='mt-1 text-destructive'>✕</span>
                    <span>Products showing signs of use or damage</span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <span className='mt-1 text-destructive'>✕</span>
                    <span>Items missing original packaging or accessories</span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <span className='mt-1 text-destructive'>✕</span>
                    <span>Custom or special order items</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Return Process */}
        <section className='mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl'>
          <H2 className='mb-12'>How to Return an Item</H2>
          <div className='space-y-6'>
            {[
              {
                step: 1,
                title: 'Contact Support',
                description:
                  'Email contact@jhuangnyc.com with your order number and reason for return'
              },
              {
                step: 2,
                title: 'Receive Return Label',
                description:
                  "We&rsquo;ll send you a prepaid return shipping label via email"
              },
              {
                step: 3,
                title: 'Ship Your Item',
                description:
                  'Pack the item securely and ship it using the provided label'
              },
              {
                step: 4,
                title: 'Receive Refund',
                description:
                  'Once received and inspected, your refund will be processed within 5-7 business days'
              }
            ].map((item, index) => (
              <div key={index} className='flex gap-6'>
                <div className='shrink-0'>
                  <div className='flex justify-center items-center bg-accent rounded-full w-10 h-10 font-bold text-accent-foreground'>
                    {item.step}
                  </div>
                </div>
                <div className='flex-1'>
                  <H3 className='mb-2 text-lg'>{item.title}</H3>
                  <Muted className='m-0'>{item.description}</Muted>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Refund Timeline */}
        <section className='py-16 border-border border-t'>
          <div className='mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl'>
            <H2 className='mb-8'>Refund Timeline</H2>
            <div className='bg-background p-8 border border-border rounded-lg'>
              <div className='space-y-4'>
                <div className='flex justify-between items-center pb-4 border-border border-b'>
                  <span className='font-medium text-foreground'>
                    Item Received
                  </span>
                  <span className='text-accent'>Day 1</span>
                </div>
                <div className='flex justify-between items-center pb-4 border-border border-b'>
                  <span className='font-medium text-foreground'>
                    Inspection & Verification
                  </span>
                  <span className='text-accent'>Days 2-3</span>
                </div>
                <div className='flex justify-between items-center pb-4 border-border border-b'>
                  <span className='font-medium text-foreground'>
                    Refund Processing
                  </span>
                  <span className='text-accent'>Days 4-7</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='font-medium text-foreground'>
                    Refund Appears in Account
                  </span>
                  <span className='text-accent'>Days 7-10</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className='mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl'>
          <div className='bg-card p-8 border border-border rounded-lg text-center'>
            <H2 className='mb-4'>Questions About Returns?</H2>
            <Muted className='m-0 mb-6'>
              Our customer support team is here to help. Contact us anytime.
            </Muted>
            <div className='flex sm:flex-row flex-col justify-center gap-4'>
              <a
                href='mailto:contact@jhuangnyc.com'
                className='font-medium text-accent hover:text-accent/80'
              >
                contact@jhuangnyc.com
              </a>
              <span className='text-muted-foreground'>•</span>
              <a
                href='tel:+16312243534'
                className='font-medium text-accent hover:text-accent/80'
              >
                +1 (631) 224-3534
              </a>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
