"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrgChartRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/org");
  }, [router]);

  return null;
}