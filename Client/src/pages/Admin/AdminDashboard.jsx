import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useFetchAllUsers } from "@/services/authServices";
import { useDSAQuestions } from "@/services/DSAServices";
import { useAptiQuestions } from "@/services/aptitudeServices";

/**
 * AdminDashboard
 * - Shows counts (users, admins, DSA questions, Aptitude questions)
 * - Quick action buttons (Create DSA, Users, Aptitude)
 * - Recent lists: latest DSA questions & latest users
 */

export default function AdminDashboard() {
  const navigate = useNavigate();

  // fetch data
  const {
    data: usersResp,
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useFetchAllUsers();

  const {
    data: dsaResp,
    isLoading: dsaLoading,
    isError: dsaError,
    refetch: refetchDSA,
  } = useDSAQuestions();

  const {
    data: aptiResp,
    isLoading: aptiLoading,
    isError: aptiError,
    refetch: refetchApti,
  } = useAptiQuestions();

  // normalize possible shapes ({ success, data }) or raw arrays
  const users = usersResp?.data ?? usersResp ?? [];
  const dsaQuestions = dsaResp?.data ?? dsaResp ?? [];
  const aptiQuestions = aptiResp?.data ?? aptiResp ?? [];

  // derived metrics
  const totalUsers = Array.isArray(users) ? users.length : 0;
  const totalAdmins = Array.isArray(users) ? users.filter((u) => (u.role || "").toLowerCase() === "admin").length : 0;
  const totalDSA = Array.isArray(dsaQuestions) ? dsaQuestions.length : 0;
  const totalApti = Array.isArray(aptiQuestions) ? aptiQuestions.length : 0;

  // recent items (sort by createdAt if available)
  const recentDSA = useMemo(() => {
    if (!Array.isArray(dsaQuestions)) return [];
    return [...dsaQuestions].sort((a, b) => {
      const ta = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const tb = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return tb - ta;
    }).slice(0, 6);
  }, [dsaQuestions]);

  const recentUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return [...users].sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return tb - ta;
    }).slice(0, 6);
  }, [users]);

  const loading = usersLoading || dsaLoading || aptiLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => { refetchUsers(); refetchDSA(); refetchApti(); }}>
              Refresh
            </Button>
            <Button onClick={() => navigate("/admin/dashboard")}>Overview</Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total Users</div>
                  <div className="text-2xl font-bold text-slate-900">{loading ? "…" : totalUsers}</div>
                </div>
                <div>
                  <Badge variant="secondary" className="text-sm">{loading ? "Loading" : "Users"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Admin Accounts</div>
                  <div className="text-2xl font-bold text-slate-900">{loading ? "…" : totalAdmins}</div>
                </div>
                <div>
                  <Badge variant="outline" className="text-sm">Admins</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">DSA Questions</div>
                  <div className="text-2xl font-bold text-slate-900">{loading ? "…" : totalDSA}</div>
                </div>
                <div>
                  <Badge variant="outline" className="text-sm">DSA</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Aptitude Questions</div>
                  <div className="text-2xl font-bold text-slate-900">{loading ? "…" : totalApti}</div>
                </div>
                <div>
                  <Badge variant="secondary" className="text-sm">Aptitudes</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <Card>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button onClick={() => navigate("/admin/dsa")}>Manage DSA</Button>
                  <Button variant="outline" onClick={() => navigate("/admin/users")}>Manage Users</Button>
                  <Button variant="outline" onClick={() => navigate("/admin/aptitude-questions")}>Manage Aptitude</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent DSA Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent DSA Questions</span>
                <div className="text-xs text-gray-500">{recentDSA.length} shown</div>
              </CardTitle>
            </CardHeader>

            <CardContent>
              {recentDSA.length === 0 ? (
                <div className="text-sm text-gray-500">No DSA questions yet.</div>
              ) : (
                <div className="space-y-3">
                  {recentDSA.map((q) => (
                    <div key={q._id ?? q.id} className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">{q.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{(q.description || "").slice(0, 120)}{(q.description || "").length > 120 ? "…" : ""}</div>
                        <div className="text-xs text-gray-400 mt-1">Tags: {(q.tags || []).slice(0,3).join(", ") || "—"}</div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xs text-gray-500">{q.timeLimit ? `${q.timeLimit}s` : "-"}</div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/dsa/submit/${q._id ?? q.id}`)}>Open</Button>
                          <Button size="sm" onClick={() => navigate(`/admin/dsa?edit=${q._id ?? q.id}`)}>Edit</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Users</span>
                <div className="text-xs text-gray-500">{recentUsers.length} shown</div>
              </CardTitle>
            </CardHeader>

            <CardContent>
              {recentUsers.length === 0 ? (
                <div className="text-sm text-gray-500">No users yet.</div>
              ) : (
                <div className="space-y-3">
                  {recentUsers.map((u) => (
                    <div key={u._id ?? u.id} className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-900">{u.name || "—"}</div>
                        <div className="text-xs text-gray-500">{u.email || "—"}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className="capitalize">{u.role ?? "user"}</Badge>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/admin/users?edit=${u._id ?? u.id}`)}>Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
