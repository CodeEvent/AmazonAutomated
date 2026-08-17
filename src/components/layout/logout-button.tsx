"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectTo: "/" })}
      className="text-sm font-medium text-ink hover:underline"
    >
      Log out
    </button>
  );
}
