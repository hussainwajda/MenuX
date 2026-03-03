const routePermissions: Record<string, string | undefined> = {
  "/dashboard": undefined,
  "/dashboard/orders": "orders.view",
  "/dashboard/tables": "tables.view",
  "/dashboard/menu": "menu.edit",
  "/dashboard/reports": "reports.view",
  "/dashboard/users": "users.manage",
  "/dashboard/roles": "users.manage",
  "/dashboard/settings": undefined,
  "/dashboard/activity-log": "reports.view",
  "/dashboard/profile": undefined,
  "/dashboard/notifications": undefined,
  "/dashboard/support": undefined,
  "/dashboard/rooms": undefined,
};

export function getRoutePermission(pathname: string): string | undefined {
  return routePermissions[pathname];
}
