
import { NextRequest, NextResponse } from 'next/server';

import {
  createPayment,
  getPayments,
  type PaymentCreationRequest,
  type GetPaymentsOptions,
} from '@/lib/hoodpay';
import { resolveHoodpayConfig } from '@/lib/config/hoodpay.config';
import { resolveService, Services } from '@/lib/services/service-registry.server';
import type { HoodpayDataService } from '@/lib/services/hoodpay-data.service';
import { logger } from '@/lib/utils/logger';

export async function GET(req: NextRequest) {
  try {
    const hoodpayConfig = resolveHoodpayConfig();
    if (!hoodpayConfig) {
      return NextResponse.json({ error: 'Hoodpay is not configured' }, { status: 500 });
    }
    const { businessId } = hoodpayConfig;
    const { searchParams } = new URL(req.url);
    const options: GetPaymentsOptions = Object.fromEntries(searchParams.entries());
    const payments = await getPayments(businessId, options);
    return NextResponse.json(payments);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const hoodpayConfig = resolveHoodpayConfig();
    if (!hoodpayConfig) {
      return NextResponse.json({ error: 'Hoodpay is not configured' }, { status: 500 });
    }
    const { businessId } = hoodpayConfig;
    const paymentDetails: PaymentCreationRequest = await req.json();
    const newPayment = await createPayment(businessId, paymentDetails);

    try {
      const hoodpayDataService = resolveService<HoodpayDataService>(Services.HOODPAY_DATA);
      await hoodpayDataService.savePayments([newPayment]);
    } catch (persistError) {
      logger.warn('Failed to persist Hoodpay payment snapshot', {
        error:
          persistError instanceof Error
            ? persistError.message
            : String(persistError),
      });
    }

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
