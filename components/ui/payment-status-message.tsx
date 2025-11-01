import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Muted } from '@/components/ui/typography';

type Status = 'processing' | 'success' | 'error';

interface PaymentStatusMessageProps {
  status: Status;
  error?: string | null;
}

const statusConfig = {
  processing: {
    icon: Loader2,
    color: 'primary',
    title: 'Processing Payment',
    message: 'Please wait while we process your payment...',
  },
  success: {
    icon: CheckCircle,
    color: 'green-500',
    title: 'Payment Successful!',
    message: 'Redirecting to confirmation...',
  },
  error: {
    icon: XCircle,
    color: 'destructive',
    title: 'Payment Error',
    message: '', // Will be replaced by error prop
  },
};

export function PaymentStatusMessage({
  status,
  error,
}: PaymentStatusMessageProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`flex gap-3 bg-${config.color}/10 p-4 border border-${config.color}/20 rounded-lg`}
    >
      <Icon
        className={`mt-0.5 w-5 h-5 text-${config.color} ${status === 'processing' ? 'animate-spin' : ''} shrink-0`}
      />
      <div>
        <Muted className={`mb-1 font-semibold text-${config.color}`}>
          {config.title}
        </Muted>
        <Muted className={`m-0 text-${config.color}/80`}>
          {status === 'error' ? error : config.message}
        </Muted>
      </div>
    </div>
  );
}
