'use client'

import { useEffect, useState } from 'react'
import { Package, Truck, CheckCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface TrackingEvent {
  id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  message: string
  location?: string
  timestamp: string
}

interface OrderTrackingProps {
  orderNumber: string
}

const STATUS_ICONS = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle
}

const STATUS_LABELS = {
  pending: 'Order Received',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered'
}

export default function OrderTracking({ orderNumber }: OrderTrackingProps) {
  const [events, setEvents] = useState<TrackingEvent[]>([])
  const [currentStatus, setCurrentStatus] =
    useState<TrackingEvent['status']>('pending')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Default initial event
    const defaultEvent: TrackingEvent = {
      id: '1',
      status: 'pending',
      message: 'Order received and awaiting processing',
      timestamp: new Date().toISOString()
    }

    // Check if Supabase is configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      // Supabase not configured, use mock data
      setEvents([defaultEvent])
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Fetch initial tracking data
    const fetchTracking = async () => {
      try {
        const { data, error } = await supabase
          .from('order_tracking')
          .select('*')
          .eq('order_number', orderNumber)
          .order('timestamp', { ascending: false })

        if (error) {
          // Table might not exist yet, use default event
          console.warn('Order tracking table not found, using default status')
          setEvents([defaultEvent])
          return
        }

        if (data && data.length > 0) {
          setEvents(data)
          setCurrentStatus(data[0].status)
        } else {
          // No tracking data for this order yet
          setEvents([defaultEvent])
        }
      } catch (error) {
        console.warn(
          'Could not fetch tracking data, using default status:',
          error
        )
        // Set default event on error
        setEvents([defaultEvent])
      } finally {
        setLoading(false)
      }
    }

    fetchTracking()

    // Subscribe to realtime updates (only if table exists)
    const channel = supabase
      .channel(`order_tracking:${orderNumber}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_tracking',
          filter: `order_number=eq.${orderNumber}`
        },
        (payload) => {
          const newEvent = payload.new as TrackingEvent
          setEvents((prev) => [newEvent, ...prev])
          setCurrentStatus(newEvent.status)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderNumber])

  if (loading) {
    return (
      <div className='bg-card mb-8 p-8 border border-border rounded-lg'>
        <h3 className='mb-6 font-semibold text-foreground text-lg'>
          Order Tracking
        </h3>
        <div className='flex justify-center items-center py-8'>
          <div className='border-accent border-b-2 rounded-full w-8 h-8 animate-spin'></div>
        </div>
      </div>
    )
  }

  const statusSteps: TrackingEvent['status'][] = [
    'pending',
    'processing',
    'shipped',
    'delivered'
  ]
  const currentStepIndex = statusSteps.indexOf(currentStatus)

  return (
    <div className='bg-card mb-8 p-8 border border-border rounded-lg'>
      <h3 className='mb-6 font-semibold text-foreground text-lg'>
        Order Tracking
      </h3>

      {/* Status Progress Bar */}
      <div className='mb-8'>
        <div className='relative flex justify-between items-center'>
          {/* Progress Line */}
          <div className='top-5 right-0 left-0 z-0 absolute bg-border h-1'>
            <div
              className='bg-accent h-full transition-all duration-500'
              style={{
                width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`
              }}
            />
          </div>

          {/* Status Steps */}
          {statusSteps.map((status, index) => {
            const Icon = STATUS_ICONS[status]
            const isActive = index <= currentStepIndex
            const isCurrent = index === currentStepIndex

            return (
              <div
                key={status}
                className='z-10 relative flex flex-col items-center'
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                    ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-card border-2 border-border text-muted-foreground'
                    }
                    ${isCurrent ? 'ring-4 ring-accent/20 scale-110' : ''}
                  `}
                >
                  <Icon className='w-5 h-5' />
                </div>
                <span
                  className={`text-xs text-center ${
                    isActive
                      ? 'text-foreground font-semibold'
                      : 'text-muted-foreground'
                  }`}
                >
                  {STATUS_LABELS[status]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tracking Events Timeline */}
      <div className='pt-6 border-border border-t'>
        <h4 className='mb-4 font-semibold text-foreground text-sm'>
          Tracking History
        </h4>
        <div className='space-y-4'>
          {events.map((event, index) => (
            <div key={event.id} className='flex gap-4'>
              <div className='shrink-0'>
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    index === 0 ? 'bg-accent' : 'bg-border'
                  }`}
                />
              </div>
              <div className='flex-1'>
                <p
                  className={`text-sm ${
                    index === 0
                      ? 'font-semibold text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {event.message}
                </p>
                {event.location && (
                  <p className='mt-1 text-muted-foreground text-xs'>
                    📍 {event.location}
                  </p>
                )}
                <p className='mt-1 text-muted-foreground text-xs'>
                  {new Date(event.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
