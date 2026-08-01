"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/Skeleton";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8 md:px-8" aria-busy="true" aria-label="Checking session">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  return <>{children}</>;
}
