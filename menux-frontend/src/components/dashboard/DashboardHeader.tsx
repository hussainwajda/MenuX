"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";

export function DashboardHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);
  const loginMode = useAuthStore((s) => s.loginMode);

  const handleLogout = () => {
    logout();
    router.replace(loginMode === "captain" ? "/captain/login" : "/login");
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Welcome back</p>
        <h1 className="text-lg font-semibold text-gray-900">{user?.name ?? "MenuX User"}</h1>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="uppercase tracking-wide">
          {role ?? "STAFF"}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger className="h-10 w-10 rounded-full bg-gray-900 text-white text-sm font-bold">
            {(user?.name?.[0] || "U").toUpperCase()}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
