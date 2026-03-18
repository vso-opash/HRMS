"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-opash-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            Loading Opash HRMS...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
