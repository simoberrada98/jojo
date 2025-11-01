'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function CheckoutFormSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='bg-card p-6 border border-border rounded-lg'>
        <div className='flex justify-between items-center'>
          <Skeleton className='w-32 h-6' />
          <Skeleton className='w-24 h-8' />
        </div>

        <div className='gap-4 grid grid-cols-1 sm:grid-cols-2 mt-6'>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className='space-y-2'>
              <Skeleton className='w-28 h-4' />
              <Skeleton className='w-full h-10' />
            </div>
          ))}
        </div>

        <div className='space-y-4 mt-6'>
          <div className='space-y-2'>
            <Skeleton className='w-32 h-4' />
            <Skeleton className='w-full h-10' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='w-24 h-4' />
            <Skeleton className='w-full h-10' />
          </div>
        </div>

        <Skeleton className='mt-6 w-full h-12' />
      </div>
    </div>
  )
}

export function ReviewStepSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='bg-card p-6 border border-border rounded-lg'>
        <Skeleton className='w-32 h-6' />
        <div className='space-y-4 mt-6'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className='flex gap-4'>
              <Skeleton className='rounded-lg w-16 h-16 shrink-0' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='w-2/3 h-4' />
                <Skeleton className='w-1/3 h-4' />
                <Skeleton className='w-1/4 h-4' />
              </div>
              <Skeleton className='w-5 h-5' />
            </div>
          ))}
        </div>
      </div>

      <div className='bg-card p-6 border border-border rounded-lg'>
        <Skeleton className='w-32 h-6' />
        <div className='space-y-3 mt-4'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className='flex justify-between'>
              <Skeleton className='w-24 h-4' />
              <Skeleton className='w-16 h-4' />
            </div>
          ))}
        </div>
        <div className='flex justify-between items-center mt-6'>
          <Skeleton className='w-24 h-5' />
          <Skeleton className='w-32 h-8' />
        </div>
        <Skeleton className='mt-6 w-full h-12' />
      </div>
    </div>
  )
}

export function PaymentStepSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='bg-card p-6 border border-border rounded-lg'>
        <Skeleton className='w-40 h-6' />
        <div className='gap-4 grid grid-cols-1 md:grid-cols-3 mt-6'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className='space-y-3 p-4 border border-border rounded-lg'
            >
              <Skeleton className='w-28 h-5' />
              <Skeleton className='w-1/2 h-4' />
              <Skeleton className='w-2/3 h-4' />
            </div>
          ))}
        </div>
      </div>

      <div className='bg-card p-6 border border-border rounded-lg'>
        <Skeleton className='w-32 h-6' />
        <div className='space-y-3 mt-4'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className='flex justify-between'>
              <Skeleton className='w-24 h-4' />
              <Skeleton className='w-16 h-4' />
            </div>
          ))}
        </div>
        <div className='flex justify-between items-center mt-6 pt-4 border-border border-t'>
          <Skeleton className='w-20 h-6' />
          <Skeleton className='w-32 h-8' />
        </div>
      </div>

      <Skeleton className='w-full h-12' />
      <Skeleton className='w-2/3 h-10' />
    </div>
  )
}

export function OrderSummarySkeleton() {
  return (
    <div className='top-24 sticky space-y-6 bg-card p-6 border border-border rounded-lg'>
      <div className='space-y-4'>
        <Skeleton className='w-32 h-6' />
        <div className='space-y-3'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className='flex justify-between'>
              <Skeleton className='w-28 h-4' />
              <Skeleton className='w-16 h-4' />
            </div>
          ))}
        </div>
      </div>
      <div className='space-y-3 pt-6 border-border border-t'>
        <Skeleton className='w-20 h-5' />
        <Skeleton className='w-32 h-8' />
        <Skeleton className='w-24 h-4' />
      </div>
      <div className='flex gap-3 bg-primary/10 p-4 border border-primary/20 rounded-lg'>
        <Skeleton className='rounded-full w-5 h-5' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='w-24 h-4' />
          <Skeleton className='w-32 h-3' />
        </div>
      </div>
    </div>
  )
}
