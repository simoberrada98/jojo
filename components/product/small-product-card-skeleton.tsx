import { Skeleton } from '@/components/ui/skeleton';

export function SmallProductCardSkeleton() {
  return (
    <div className="group relative border border-border rounded-lg overflow-hidden">
      <Skeleton className="w-full aspect-square" />
      <div className="p-3">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
