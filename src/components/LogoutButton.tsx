"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ logoutUrl, redirectTo }: { logoutUrl: string; redirectTo: string }) {
  const router = useRouter();

  async function logout() {
    await fetch(logoutUrl, { method: "POST" });
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button onClick={logout} className="btn btn-outline text-sm py-2! px-4!">
      Log out
    </button>
  );
}
