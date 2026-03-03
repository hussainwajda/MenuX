"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { rbacClient } from "@/lib/rbac-client";
import { useRestaurantSessionStore } from "@/store/useRestaurantSessionStore";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type RoleDto = {
  id: string;
  name: string;
  description?: string | null;
  permissions: string[];
};

type UserDto = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
};

type PermissionRow = {
  page: "orders" | "tables" | "menu" | "reports" | "users";
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

const defaultPermissionRows = (): PermissionRow[] => [
  { page: "orders", canView: false, canCreate: false, canEdit: false, canDelete: false },
  { page: "tables", canView: false, canCreate: false, canEdit: false, canDelete: false },
  { page: "menu", canView: false, canCreate: false, canEdit: false, canDelete: false },
  { page: "reports", canView: false, canCreate: false, canEdit: false, canDelete: false },
  { page: "users", canView: false, canCreate: false, canEdit: false, canDelete: false },
];

export default function EmployeeManagementPage() {
  const accessToken = useRestaurantSessionStore((s) => s.accessToken);
  const rbacToken = useRestaurantSessionStore((s) => s.rbacToken);
  const setRbacSession = useRestaurantSessionStore((s) => s.setRbacSession);
  const [activeTab, setActiveTab] = useState<"employees" | "roles">("employees");
  const [showUserForm, setShowUserForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectingRbac, setConnectingRbac] = useState(false);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
    isActive: true,
  });

  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
  });
  const [permissionRows, setPermissionRows] = useState<PermissionRow[]>(defaultPermissionRows);

  const loadData = useCallback(async () => {
    if (!rbacToken) return;
    try {
      setPageError("");
      const [roleRes, userRes] = await Promise.all([
        rbacClient.getRoles() as Promise<RoleDto[]>,
        rbacClient.getUsers() as Promise<UserDto[]>,
      ]);
      setRoles(roleRes || []);
      setUsers(userRes || []);
      if (!userForm.roleId && roleRes.length > 0) {
        setUserForm((prev) => ({ ...prev, roleId: roleRes[0].id }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load employee data";
      setPageError(message);
    }
  }, [rbacToken, userForm.roleId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!rbacToken && accessToken && !connectingRbac) {
      void connectRbacSession();
    }
    // Intentionally run when session tokens change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rbacToken, accessToken]);

  const selectedPermissionKeys = useMemo(() => {
    const keys: string[] = [];
    const mapFixedPermissionKey: Record<Exclude<PermissionRow["page"], "orders">, string> = {
      tables: "tables.view",
      menu: "menu.edit",
      reports: "reports.view",
      users: "users.manage",
    };

    for (const row of permissionRows) {
      const anyChecked = row.canView || row.canCreate || row.canEdit || row.canDelete;
      if (row.page !== "orders") {
        if (anyChecked) {
          keys.push(mapFixedPermissionKey[row.page]);
        }
        continue;
      }
      if (row.canView) keys.push("orders.view");
      if (row.canCreate) keys.push("orders.create");
      if (row.canEdit) keys.push("orders.update");
      if (row.canDelete) keys.push("orders.delete");
    }
    return Array.from(new Set(keys));
  }, [permissionRows]);

  const updatePermission = (
    page: PermissionRow["page"],
    key: "canView" | "canCreate" | "canEdit" | "canDelete",
    checked: boolean
  ) => {
    setPermissionRows((prev) => prev.map((r) => (r.page === page ? { ...r, [key]: checked } : r)));
  };

  const connectRbacSession = async () => {
    if (!accessToken) {
      toast.error("Restaurant session unavailable");
      return;
    }

    setConnectingRbac(true);
    try {
      const response = await fetch(API_ENDPOINTS.ownerRbacSession(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      });
      const body = (await response.json().catch(() => null)) as
        | { message?: string; data?: { token?: string; permissions?: string[]; roleName?: string } }
        | null;

      if (!response.ok || !body?.data?.token) {
        throw new Error(body?.message || "Unable to connect RBAC session");
      }

      setRbacSession({
        rbacToken: body.data.token,
        permissions: Array.isArray(body.data.permissions) ? body.data.permissions : [],
        userRole: body.data.roleName || null,
      });
      toast.success("RBAC session connected");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to connect RBAC session";
      toast.error(message);
    } finally {
      setConnectingRbac(false);
    }
  };

  const createRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      toast.error("Role name is required");
      return;
    }
    if (selectedPermissionKeys.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    setLoading(true);
    try {
      await rbacClient.createRole({
        name: roleForm.name.trim(),
        description: roleForm.description.trim() || null,
        permissionKeys: selectedPermissionKeys,
      });
      toast.success("Role created successfully");
      setRoleForm({ name: "", description: "" });
      setPermissionRows(defaultPermissionRows());
      setShowRoleForm(false);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create role";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.roleId) {
      toast.error("Please choose a role");
      return;
    }

    setLoading(true);
    try {
      await rbacClient.createUser({
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        password: userForm.password,
        roleId: userForm.roleId,
        isActive: userForm.isActive,
      });
      toast.success("Employee created successfully");
      setUserForm((prev) => ({ ...prev, name: "", email: "", password: "", isActive: true }));
      setShowUserForm(false);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create employee";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!accessToken) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Restaurant session unavailable. Please login to continue.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
        <p className="text-sm text-gray-600">Manage roles and employee credentials from one place</p>
      </div>

      {!rbacToken && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900">RBAC Session Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-800 mb-4">
              Connect RBAC from your current restaurant owner session to manage employees and roles.
            </p>
            <div className="flex">
              <Button type="button" onClick={() => void connectRbacSession()} disabled={connectingRbac}>
                {connectingRbac ? "Connecting..." : "Connect RBAC"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {pageError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700">{pageError}</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "employees" | "roles")} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button type="button" onClick={() => setShowUserForm((prev) => !prev)} disabled={!rbacToken}>
              {showUserForm ? "Close Form" : "Add Employee"}
            </Button>
          </div>

          {showUserForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create Employee</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createUser} className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <Input
                      value={userForm.name}
                      onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <Input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Designation (Role)</label>
                    <select
                      value={userForm.roleId}
                      onChange={(e) => setUserForm((p) => ({ ...p, roleId: e.target.value }))}
                      className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Active User</p>
                      <p className="text-xs text-gray-500">Disable to prevent captain login</p>
                    </div>
                    <Switch
                      checked={userForm.isActive}
                      onCheckedChange={(checked) => setUserForm((p) => ({ ...p, isActive: checked }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Employee"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Employees</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {users.length === 0 && <p className="text-sm text-gray-600">No employees found.</p>}
              {users.map((user) => (
                <div key={user.id} className="rounded-lg border border-gray-200 p-3 flex justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{user.roleName}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 h-fit rounded-full ${
                      user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button type="button" onClick={() => setShowRoleForm((prev) => !prev)} disabled={!rbacToken}>
              {showRoleForm ? "Close Form" : "Add Role"}
            </Button>
          </div>

          {showRoleForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create Role</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createRole} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Role Name</label>
                      <Input
                        value={roleForm.name}
                        onChange={(e) => setRoleForm((p) => ({ ...p, name: e.target.value }))}
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <Input
                        value={roleForm.description}
                        onChange={(e) => setRoleForm((p) => ({ ...p, description: e.target.value }))}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-gray-900">Page Permissions</p>
                      <p className="text-xs text-gray-500">{selectedPermissionKeys.length} selected</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="py-2 pr-4">Page</th>
                            <th className="py-2 pr-4">Can View</th>
                            <th className="py-2 pr-4">Can Create</th>
                            <th className="py-2 pr-4">Can Edit</th>
                            <th className="py-2 pr-4">Can Delete</th>
                          </tr>
                        </thead>
                        <tbody>
                          {permissionRows.map((row) => (
                            <tr key={row.page} className="border-t border-gray-100">
                              <td className="py-2 pr-4 font-medium text-gray-800 capitalize">{row.page}</td>
                              {(["canView", "canCreate", "canEdit", "canDelete"] as const).map((col) => (
                                <td key={col} className="py-2 pr-4">
                                  <input
                                    id={`${row.page}-${col}`}
                                    type="checkbox"
                                    checked={row[col]}
                                    onChange={(e) => updatePermission(row.page, col, e.target.checked)}
                                    className="rounded border-gray-300"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Role"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {roles.length === 0 && <p className="text-sm text-gray-600">No roles found.</p>}
              {roles.map((role) => (
                <div key={role.id} className="rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold text-gray-900">{role.name}</p>
                  {role.description && <p className="text-xs text-gray-600 mt-1">{role.description}</p>}
                  <p className="text-xs text-gray-500 mt-2">{role.permissions.join(", ")}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
