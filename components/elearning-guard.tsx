"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getMe } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import { savePostLoginReturnTo } from "@/lib/post-login-routing";
import type { Me } from "@/lib/types";

type ElearningGuardProps = {
  children: React.ReactNode;
};

export function ElearningGuard({ children }: ElearningGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");
  const [user, setUser] = useState<Me | null>(null);

  useEffect(() => {
    async function checkWorkerAccess() {
      const targetPath = pathname || "/elearning";
      const token = getToken();

      if (!token) {
        savePostLoginReturnTo(targetPath);
        clearToken();
        setStatus("denied");
        router.replace("/elearning/login");
        return;
      }

      try {
        const me = await getMe();
        setUser(me);
        setStatus("allowed");
      } catch {
        savePostLoginReturnTo(targetPath);
        clearToken();
        setUser(null);
        setStatus("denied");
        router.replace("/elearning/login");
      }
    }

    void checkWorkerAccess();
  }, [pathname, router]);

  if (status !== "allowed") {
    return (
      <main className="page">
        <div className="container">
          <div className="card stack center" style={{ minHeight: 260 }}>
            <div className="section-title">Vérification de votre accès E-Learning...</div>
            <div className="muted">
              Préparation de votre espace de formation
              {user?.given_name ? `, ${user.given_name}` : ""}.
            </div>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}