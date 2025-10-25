import React, { useMemo, useState } from "react";
import {
  useFetchAllUsers,
  useUpdateUser,
  useDeleteUser,
} from "@/services/authServices";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

/**
 * AdminUsers
 *
 * Admin UI to list all users, edit user details (name/email/role), change role,
 * and delete users.
 *
 * Hooks used:
 *  - useFetchAllUsers(params)
 *  - useUpdateUser()
 *  - useDeleteUser()
 */

export default function AdminUsers() {
  // fetch users
  const {
    data: listResp,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchAllUsers();

  // normalize different response shapes: { success, data: [...] } or raw array
  const users = useMemo(() => {
    if (!listResp) return [];
    return listResp?.data ?? listResp ?? [];
  }, [listResp]);

  // local state
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null); // user object for editing
  const [submitting, setSubmitting] = useState(false);

  // mutations
  const updateMutation = useUpdateUser({
    onSuccess: (res) => {
      toast.success("User updated");
      refetch();
      closeModal();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Update failed");
    },
  });

  const deleteMutation = useDeleteUser({
    onSuccess: () => {
      toast.success("User deleted");
      refetch();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Delete failed");
    },
  });

  // local form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");

  // filtered users by search query
  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return users;
    return (users || []).filter((u) => {
      const nameMatch = String(u.name || "").toLowerCase().includes(q);
      const emailMatch = String(u.email || "").toLowerCase().includes(q);
      const roleMatch = String(u.role || "").toLowerCase().includes(q);
      return nameMatch || emailMatch || roleMatch;
    });
  }, [users, query]);

  function openEditModal(user) {
    setSelected(user);
    setName(user.name || "");
    setEmail(user.email || "");
    setRole(user.role || "user");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelected(null);
    setSubmitting(false);
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (!selected) return;
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        id: selected._id ?? selected.id,
        payload: {
          name: name.trim(),
          email: email.trim(),
          role: role,
        },
      });
    } catch (err) {
      // handled by onError of mutation
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(user) {
    const id = user._id ?? user.id;
    if (!id) return toast.error("Missing user id");
    const ok = window.confirm(`Delete user "${user.name}" (${user.email})? This cannot be undone.`);
    if (!ok) return;
    deleteMutation.mutate(id);
  }

  async function toggleAdmin(user) {
    const id = user._id ?? user.id;
    if (!id) return toast.error("Missing user id");
    const newRole = (user.role || "user") === "admin" ? "user" : "admin";
    const ok = window.confirm(`Change role of "${user.name}" to "${newRole}"?`);
    if (!ok) return;
    try {
      await updateMutation.mutateAsync({ id, payload: { role: newRole } });
      // toast handled in onSuccess
    } catch (err) {
      // handled by onError
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading users…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Failed to load users: {String(error?.message ?? error)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search by name, email or role…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users ({(users || []).length})</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="text-left text-xs text-gray-600 border-b">
                  <tr>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3">Role</th>
                    <th className="py-2 px-3">Created</th>
                    <th className="py-2 px-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">No users found.</td>
                    </tr>
                  ) : (
                    filtered.map((u) => {
                      const id = u._id ?? u.id;
                      return (
                        <tr key={id} className="border-b last:border-b-0">
                          <td className="py-3 px-3 align-top max-w-md">
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-gray-500 mt-1">ID: {id}</div>
                          </td>

                          <td className="py-3 px-3 align-top">
                            <div className="text-xs">{u.email}</div>
                          </td>

                          <td className="py-3 px-3 align-top">
                            <Badge className="capitalize">{u.role ?? "user"}</Badge>
                          </td>

                          <td className="py-3 px-3 align-top text-xs text-gray-500">
                            {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                          </td>

                          <td className="py-3 px-3 align-top">
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => openEditModal(u)}>Edit</Button>
                              <Button size="sm" variant="ghost" onClick={() => toggleAdmin(u)}>
                                {u.role === "admin" ? "Demote" : "Promote"}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(u)}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <div
        aria-hidden={!modalOpen}
        className={`fixed inset-0 z-50 flex items-center justify-center ${modalOpen ? "" : "pointer-events-none"}`}
      >
        {/* backdrop */}
        <div
          onClick={closeModal}
          className={`absolute inset-0 bg-black/40 transition-opacity ${modalOpen ? "opacity-100" : "opacity-0"}`}
        />

        <div className={`relative w-full max-w-2xl mx-4 transition-transform ${modalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">{selected ? "Edit User" : "Edit User"}</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={closeModal}>Close</Button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div>
                  <Label>Role</Label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-2">
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
                <Button variant="outline" onClick={closeModal} type="button">Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
