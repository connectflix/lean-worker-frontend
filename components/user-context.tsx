"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Me } from "@/lib/types";

export type UserContextValue = {
  user: Me | null;
  setUser: (user: Me | null) => void;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({
  value,
  children,
}: {
  value: UserContextValue;
  children: ReactNode;
}) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Returns the current user context.
 *
 * This strict hook is intended for components that must always be rendered
 * inside `UserProvider`.
 */
export function useCurrentUser(): UserContextValue {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      "useCurrentUser must be used within a UserProvider / " +
        "useCurrentUser doit être utilisé dans un UserProvider.",
    );
  }

  return context;
}

/**
 * Returns the current user context when available without throwing.
 *
 * Useful for shared or transitional components that may render before the
 * authenticated application shell has mounted its provider.
 */
export function useOptionalCurrentUser(): UserContextValue | null {
  return useContext(UserContext);
}