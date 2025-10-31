"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-card p-6 border border-border rounded-lg">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="mt-6 gap-4 grid grid-cols-1 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <Skeleton className="mt-6 h-12 w-full" />
      </div>
    </div>
  );
}

export function ReviewStepSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-card p-6 border border-border rounded-lg">
        <Skeleton className="h-6 w-32" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-4">
              <Skeleton className="flex-shrink-0 h-16 w-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <Skeleton className="h-5 w-5" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card p-6 border border-border rounded-lg">
        <Skeleton className="h-6 w-32" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between items-center">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="mt-6 h-12 w-full" />
      </div>
    </div>
  );
}

export function PaymentStepSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-card p-6 border border-border rounded-lg">
        <Skeleton className="h-6 w-40" />
        <div className="mt-6 gap-4 grid grid-cols-1 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-lg border border-border p-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card p-6 border border-border rounded-lg">
        <Skeleton className="h-6 w-32" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-10 w-2/3" />
    </div>
  );
}

export function OrderSummarySkeleton() {
  return (
    <div className="top-24 sticky space-y-6 bg-card p-6 border border-border rounded-lg">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border pt-6 space-y-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex gap-3 bg-primary/10 p-4 border border-primary/20 rounded-lg">
        <Skeleton className="h-5 w-5 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}
