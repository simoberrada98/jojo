
import { NextRequest, NextResponse } from 'next/server';

import {
  getWebhooks,
  createWebhook,
  deleteWebhook,
  resetWebhookSecret,
  type CreateWebhookRequest,
} from '@/lib/hoodpay';
import { resolveHoodpayConfig } from '@/lib/config/hoodpay.config';

export async function GET(_req: NextRequest) {
  try {
    const hoodpayConfig = resolveHoodpayConfig();
    if (!hoodpayConfig) {
      return NextResponse.json({ error: 'Hoodpay is not configured' }, { status: 500 });
    }
    const { businessId } = hoodpayConfig;
    const webhooks = await getWebhooks(businessId);
    return NextResponse.json(webhooks);
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
    const { searchParams } = new URL(req.url);
    if (searchParams.get('action') === 'reset-secret') {
      const result = await resetWebhookSecret(businessId);
      return NextResponse.json(result);
    }
    const webhookDetails: CreateWebhookRequest = await req.json();
    const newWebhook = await createWebhook(businessId, webhookDetails);
    return NextResponse.json(newWebhook, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const hoodpayConfig = resolveHoodpayConfig();
    if (!hoodpayConfig) {
      return NextResponse.json({ error: 'Hoodpay is not configured' }, { status: 500 });
    }
    const { businessId } = hoodpayConfig;
    const { searchParams } = new URL(req.url);
    const webhookId = searchParams.get('webhookId');
    if (!webhookId) {
      return NextResponse.json({ error: 'webhookId is required.' }, { status: 400 });
    }
    await deleteWebhook(businessId, webhookId);
    return new Response(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
