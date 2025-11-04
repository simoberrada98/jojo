import { NextResponse, type NextRequest } from 'next/server';
import { getExternalReviewSummary } from '@/lib/services/reviews/external-review.service';

export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ gtin: string }> }
) {
  const { gtin } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const fallback = searchParams.get('q') || undefined;
  const brand = searchParams.get('brand') || undefined;

  if (!gtin) {
    return NextResponse.json({ error: 'GTIN required' }, { status: 400 });
  }

  try {
    const summary = await getExternalReviewSummary(gtin, {
      name: fallback,
      brand,
    });

    if (!summary) {
      return NextResponse.json(
        { message: 'No reviews found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json(summary);
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400'
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
