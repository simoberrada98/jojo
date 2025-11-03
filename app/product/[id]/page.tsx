import { notFound, redirect } from 'next/navigation';

type ProductPageProps = {
  // In Next.js 16, route params may be a Promise
  params: Promise<{
    id?: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  // Validate param before using
  const safeId = typeof id === 'string' ? id.trim() : '';
  if (!safeId) {
    notFound();
  }

  redirect(`/products/${encodeURIComponent(safeId)}`);
}
