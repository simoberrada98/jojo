import { redirect } from 'next/navigation';

type LegacyProductPageProps = {
  params: {
    id: string;
  };
};

export default function LegacyProductPage({ params }: LegacyProductPageProps) {
  redirect(`/miners/${params.id}`);
}
