"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminUsersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/employee");
  }, [router]);

  return null;
}