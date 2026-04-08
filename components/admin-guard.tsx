"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAdminToken, getAdminToken } from "@/lib/admin-auth";
import { getAdminMe } from "@/lib/api";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");

  useEffect(() => {
    async function checkAdminAccess() {
      const token = getAdminToken();

      if (!token) {
        clearAdminToken();
        setStatus("denied");
        router.replace("/admin/login");
        return;
      }

      try {
        await getAdminMe();
        setStatus("allowed");
      } catch {
        clearAdminToken();
        setStatus("denied");
        router.replace("/admin/login");
      }
    }

    void checkAdminAccess();
  }, [router]);

  if (status !== "allowed") {
    return (
      <main className="page">
        <div className="container">
          <div className="card">Checking admin access...</div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}