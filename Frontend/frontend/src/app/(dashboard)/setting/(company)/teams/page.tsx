"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeamsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/employee/teams");
  }, [router]);

  return null;
}