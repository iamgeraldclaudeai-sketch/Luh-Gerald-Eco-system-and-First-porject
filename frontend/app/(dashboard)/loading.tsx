import { Skeleton } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
      <Skeleton className="h-28 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </div>
  );
}
