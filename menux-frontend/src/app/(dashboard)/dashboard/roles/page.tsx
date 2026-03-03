"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RolesPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/users");
  }, [router]);

  return null;
}
