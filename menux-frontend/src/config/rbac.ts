import {
  Activity,
  BarChart3,
  LayoutDashboard,
  Settings,
  Shield,
  Soup,
  Table,
  Users,
  ClipboardList,
} from "lucide-react";

export const PERMISSION_MODULES = [
  { key: "orders", label: "Orders", actions: ["view", "create", "update", "delete"] },
  { key: "tables", label: "Tables", actions: ["view"] },
  { key: "menu", label: "Menu", actions: ["edit"] },
  { key: "reports", label: "Reports", actions: ["view"] },
  { key: "users", label: "Users", actions: ["manage"] },
] as const;

export const DASHBOARD_MENU = [
  { label: "Dashboard", href: "/dashboard", permission: "", icon: LayoutDashboard },
  { label: "Orders", href: "/dashboard/orders", permission: "orders.view", icon: ClipboardList },
  { label: "Tables", href: "/dashboard/tables", permission: "tables.view", icon: Table },
  { label: "Menu", href: "/dashboard/menu", permission: "menu.edit", icon: Soup },
  { label: "Reports", href: "/dashboard/reports", permission: "reports.view", icon: BarChart3 },
  { label: "Users", href: "/dashboard/users", permission: "users.manage", icon: Users },
  { label: "Roles", href: "/dashboard/roles", permission: "users.manage", icon: Shield },
  { label: "Activity Log", href: "/dashboard/activity-log", permission: "reports.view", icon: Activity },
  { label: "Settings", href: "/dashboard/settings", permission: "", icon: Settings },
];

export const DEFAULT_OWNER_PERMISSIONS = PERMISSION_MODULES.flatMap((module) =>
  module.actions.map((action) => `${module.key}.${action}`)
);

export const DEFAULT_CAPTAIN_PERMISSIONS = [
  "orders.view",
  "orders.create",
  "orders.update",
  "tables.view",
];
