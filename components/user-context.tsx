"use client";

import { createContext, useContext } from "react";
import type { Me } from "@/lib/types";

type UserContextValue = {
  user: Me | null;
  setUser: (user: Me | null) => void;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({
  value,
  children,
}: {
  value: UserContextValue;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useCurrentUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within a UserProvider");
  }
  return context;
}