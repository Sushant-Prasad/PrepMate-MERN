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
import {
  Users,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  X,
  ShieldCheck,
  ShieldOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Mail,
  Calendar,
  UserCircle,
  Crown,
  ArrowUpCircle,
  ArrowDownCircle,
  MoreVertical,
} from "lucide-react";

/**
 * AdminUsers
 * Enhanced UI with brand colors and card-based responsive layout
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

  // normalize different response shapes
  const users = useMemo(() => {
    if (!listResp) return [];
    return listResp?.data ?? listResp ?? [];
  }, [listResp]);

  // local state
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // mutations
  const updateMutation = useUpdateUser({
    onSuccess: (res) => {
      toast.success("User updated successfully!");
      refetch();
      closeModal();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Update failed");
    },
  });

  const deleteMutation = useDeleteUser({
    onSuccess: () => {
      toast.success("User deleted successfully!");
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
    } catch (err) {
      // handled by onError
    }
  }

  const adminCount = users.filter((u) => (u.role || "").toLowerCase() === "admin").length;
  const userCount = users.length - adminCount;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-[#3DBFD9] animate-pulse mx-auto mb-4" />
          <div className="text-gray-600 font-medium">Loading users...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 font-medium">Failed to load users: {String(error?.message ?? error)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-[#3DBFD9]/20 to-[#3DBFD9]/5 rounded-2xl">
                  <Users className="w-8 h-8 text-[#3DBFD9]" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#03045E] via-[#0353a4] to-[#3DBFD9] bg-clip-text text-transparent">
                    User Management
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Manage user accounts and permissions
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-1 bg-gradient-to-r from-[#03045E] via-[#3DBFD9] to-transparent rounded-full" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-[#3DBFD9]/20 to-[#3DBFD9]/5 rounded-xl">
                  <Users className="w-6 h-6 text-[#3DBFD9]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-[#03045E]">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-[#03045E]/20 to-[#03045E]/5 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-[#03045E]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-[#03045E]">{adminCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-xl">
                  <UserCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Regular Users</p>
                  <p className="text-2xl font-bold text-[#03045E]">{userCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or role..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 border-gray-200 focus:border-[#3DBFD9] focus:ring-[#3DBFD9]"
            />
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-[#3DBFD9] text-[#03045E] hover:bg-[#3DBFD9]/10 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Users Grid */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#3DBFD9]" />
            <h2 className="text-lg font-bold text-[#03045E]">All Users</h2>
            <Badge className="bg-[#3DBFD9]/10 text-[#3DBFD9] border-none">
              {filtered.length} shown
            </Badge>
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card className="border-none shadow-xl bg-white">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#3DBFD9]/20 to-[#3DBFD9]/5 rounded-full mb-4">
                  <Users className="w-10 h-10 text-[#3DBFD9]/60" />
                </div>
                <p className="text-gray-500 mb-2">No users found</p>
                <p className="text-sm text-gray-400">
                  {query ? "Try adjusting your search" : "No users available"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((u) => {
              const id = u._id ?? u.id;
              const isAdmin = (u.role || "").toLowerCase() === "admin";
              
              return (
                <Card
                  key={id}
                  className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-white group overflow-hidden"
                >
                  <CardContent className="p-0">
                    {/* Card Header with Gradient */}
                    <div className={`p-6 pb-4 ${
                      isAdmin 
                        ? 'bg-gradient-to-br from-[#03045E] to-[#0353a4]' 
                        : 'bg-gradient-to-br from-[#3DBFD9] to-[#0096c7]'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="relative">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-2xl border-2 border-white/30 shadow-lg">
                            {(u.name || "?").charAt(0).toUpperCase()}
                          </div>
                          {isAdmin && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                              <Crown className="w-3.5 h-3.5 text-yellow-900" />
                            </div>
                          )}
                        </div>
                        
                        <Badge className={`${
                          isAdmin
                            ? 'bg-white/20 text-white border-white/30 backdrop-blur-sm'
                            : 'bg-white/20 text-white border-white/30 backdrop-blur-sm'
                        }`}>
                          {isAdmin && <ShieldCheck className="w-3 h-3 mr-1" />}
                          {u.role ?? "user"}
                        </Badge>
                      </div>
                      
                      <div className="text-white">
                        <h3 className="font-bold text-lg mb-1 truncate">{u.name}</h3>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 pt-4 space-y-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm truncate">{u.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-xs">
                          Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </span>
                      </div>

                      <div className="pt-2 text-xs text-gray-400 font-mono truncate">
                        ID: {id}
                      </div>

                      <Separator className="my-3" />

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(u)}
                          className="border-[#3DBFD9] text-[#3DBFD9] hover:bg-[#3DBFD9] hover:text-white transition-all duration-300 w-full"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAdmin(u)}
                          className={`${
                            isAdmin
                              ? 'border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white'
                              : 'border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                          } transition-all duration-300 w-full`}
                        >
                          {isAdmin ? (
                            <>
                              <ArrowDownCircle className="w-3 h-3 mr-1" />
                              Demote
                            </>
                          ) : (
                            <>
                              <ArrowUpCircle className="w-3 h-3 mr-1" />
                              Promote
                            </>
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(u)}
                          className="bg-red-500 hover:bg-red-600 transition-all duration-300 w-full col-span-2"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete User
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal - Fixed overflow */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div
            onClick={closeModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-[#3DBFD9]/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#3DBFD9]/20 rounded-xl">
                  <Edit className="w-6 h-6 text-[#3DBFD9]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#03045E]">Edit User</h3>
                  <p className="text-sm text-gray-600">Update user information</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                type="button"
                className="rounded-full hover:bg-gray-200 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
                
                {/* User Avatar Preview */}
                {selected && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#3DBFD9]/5 to-transparent rounded-lg border border-[#3DBFD9]/20">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#3DBFD9] to-[#0096c7] rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[#3DBFD9]/30 flex-shrink-0">
                      {(selected.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#03045E] truncate">{selected.name}</p>
                      <p className="text-sm text-gray-600 truncate">{selected.email}</p>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    Name
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 h-11 focus:border-[#3DBFD9] focus:ring-[#3DBFD9]"
                    placeholder="Enter user name"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 h-11 focus:border-[#3DBFD9] focus:ring-[#3DBFD9]"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Role
                    <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-2 w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-[#3DBFD9] focus:ring-2 focus:ring-[#3DBFD9]/20 transition-all"
                  >
                    <option value="user">User - Regular access</option>
                    <option value="admin">Admin - Full permissions</option>
                  </select>
                </div>

                {/* Info Note */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Important</p>
                    <p className="text-blue-700">
                      Changing a user's role will immediately affect their access permissions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  type="button"
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-[#3DBFD9] to-[#0096c7] hover:from-[#34aac3] hover:to-[#0087b3] text-white shadow-lg shadow-[#3DBFD9]/30 transition-all duration-300"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}