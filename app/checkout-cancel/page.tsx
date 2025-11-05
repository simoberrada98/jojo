'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowRight } from 'lucide-react';
import { H1, P } from '@/components/ui/typography';

function CheckoutCancelContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <PageLayout>
      <main className="flex-1 pt-20">
        <section className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-2xl text-center">
          {/* Cancel Icon */}
          <div className="mb-8">
            <div className="inline-flex justify-center items-center bg-destructive/20 mb-6 rounded-full w-20 h-20">
              <XCircle className="w-12 h-12 text-destructive" />
            </div>
            <H1 className="mb-4 font-bold text-foreground text-4xl md:text-5xl">
              Order Cancelled
            </H1>
            <P className="text-muted-foreground text-lg">
              Your order was cancelled. If this was a mistake, please try again or contact support.
            </P>
            {orderNumber && (
              <P className="mt-4 text-muted-foreground text-md">
                Order Number: <span className="font-semibold">{orderNumber}</span>
              </P>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8">
            <Link href="/checkout">
              <Button
                variant="default"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Return to Checkout
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Continue Shopping */}
          <div className="mt-8 text-center">
            <P className="mb-4 text-muted-foreground">
              Not ready to give up? Explore more products.
            </P>
            <Link href="/collection">
              <Button
                variant="ghost"
                className="hover:bg-accent/10 text-accent hover:text-accent"
              >
                Continue Shopping
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center bg-background min-h-screen">
          <div className="border-accent border-b-2 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      }
    >
      <CheckoutCancelContent />
    </Suspense>
  );
}
