import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <div className="mx-auto max-w-7xl">
        <Skeleton className="h-10 w-24 mb-8" />

        <div className="gap-12 grid grid-cols-1 lg:grid-cols-2">
          {/* Left column */}
          <div>
            <Skeleton className="w-full aspect-square rounded-lg" />
            <div className="mt-12">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="bg-card p-6 border border-border rounded-xl">
              <Skeleton className="h-10 w-1/2 mb-4" />
              <Skeleton className="h-16 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
