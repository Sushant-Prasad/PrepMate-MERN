import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useFetchAllUsers } from "@/services/authServices";
import { useDSAQuestions } from "@/services/DSAServices";
import { useAptiQuestions } from "@/services/aptitudeServices";
import { 
  Users, 
  ShieldCheck, 
  Code2, 
  Brain, 
  RefreshCw, 
  TrendingUp,
  Clock,
  Eye,
  Pencil,
  LayoutDashboard,
  ChevronRight,
  Sparkles
} from "lucide-react";

/**
 * AdminDashboard
 * Enhanced UI with Tailwind CSS and brand colors
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

  // normalize possible shapes
  const users = usersResp?.data ?? usersResp ?? [];
  const dsaQuestions = dsaResp?.data ?? dsaResp ?? [];
  const aptiQuestions = aptiResp?.data ?? aptiResp ?? [];

  // derived metrics
  const totalUsers = Array.isArray(users) ? users.length : 0;
  const totalAdmins = Array.isArray(users) ? users.filter((u) => (u.role || "").toLowerCase() === "admin").length : 0;
  const totalDSA = Array.isArray(dsaQuestions) ? dsaQuestions.length : 0;
  const totalApti = Array.isArray(aptiQuestions) ? aptiQuestions.length : 0;

  // recent items
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

  const handleRefresh = () => {
    refetchUsers();
    refetchDSA();
    refetchApti();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#03045E] via-[#0353a4] to-[#3DBFD9] bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your platform with ease
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={loading}
                className="border-[#3DBFD9] text-[#03045E] hover:bg-[#3DBFD9]/10 hover:border-[#3DBFD9] transition-all duration-300"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button 
                onClick={() => navigate("/admin/dashboard")}
                className="bg-gradient-to-r from-[#3DBFD9] to-[#0096c7] hover:from-[#34aac3] hover:to-[#0087b3] text-white shadow-lg shadow-[#3DBFD9]/30 transition-all duration-300"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Overview
              </Button>
            </div>
          </div>
          
          <div className="h-1 bg-gradient-to-r from-[#03045E] via-[#3DBFD9] to-transparent rounded-full" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          
          {/* Total Users */}
          <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group bg-white">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3DBFD9]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#3DBFD9]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-[#3DBFD9]/20 to-[#3DBFD9]/5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-[#3DBFD9]" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-[#3DBFD9]/10 rounded-full">
                  <TrendingUp className="w-3 h-3 text-[#3DBFD9]" />
                  <span className="text-xs font-semibold text-[#3DBFD9]">Live</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl sm:text-4xl font-bold text-[#03045E]">
                  {loading ? (
                    <span className="inline-block animate-pulse">...</span>
                  ) : (
                    totalUsers.toLocaleString()
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Accounts */}
          <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group bg-white">
            <div className="absolute inset-0 bg-gradient-to-br from-[#03045E]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#03045E]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-[#03045E]/20 to-[#03045E]/5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-6 h-6 text-[#03045E]" />
                </div>
                <Badge className="bg-[#03045E] text-white border-none shadow-lg shadow-[#03045E]/30 hover:bg-[#03045E]/90">
                  Admins
                </Badge>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Admin Accounts</p>
                <p className="text-3xl sm:text-4xl font-bold text-[#03045E]">
                  {loading ? (
                    <span className="inline-block animate-pulse">...</span>
                  ) : (
                    totalAdmins
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* DSA Questions */}
          <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group bg-white">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Code2 className="w-6 h-6 text-emerald-600" />
                </div>
                <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 hover:bg-emerald-100">
                  DSA
                </Badge>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">DSA Questions</p>
                <p className="text-3xl sm:text-4xl font-bold text-[#03045E]">
                  {loading ? (
                    <span className="inline-block animate-pulse">...</span>
                  ) : (
                    totalDSA.toLocaleString()
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Aptitude Questions */}
          <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group bg-white">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <Badge className="bg-purple-100 text-purple-600 border-none hover:bg-purple-200">
                  Aptitude
                </Badge>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Aptitude Questions</p>
                <p className="text-3xl sm:text-4xl font-bold text-[#03045E]">
                  {loading ? (
                    <span className="inline-block animate-pulse">...</span>
                  ) : (
                    totalApti.toLocaleString()
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 border-none shadow-xl overflow-hidden bg-gradient-to-r from-[#03045E] via-[#023e8a] to-[#0353a4]">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#3DBFD9]" />
                  <h3 className="text-lg sm:text-xl font-bold text-white">Quick Actions</h3>
                </div>
                <p className="text-sm text-gray-300">
                  Navigate to different management sections
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => navigate("/admin/dsa")}
                  className="bg-[#3DBFD9] hover:bg-[#34aac3] text-white border-none shadow-lg shadow-[#3DBFD9]/30 transition-all duration-300 hover:scale-105"
                >
                  <Code2 className="w-4 h-4 mr-2" />
                  Manage DSA
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/admin/users")}
                  className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-[#03045E] backdrop-blur-sm transition-all duration-300"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/admin/aptitude-questions")}
                  className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-[#03045E] backdrop-blur-sm transition-all duration-300"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Manage Aptitude
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}