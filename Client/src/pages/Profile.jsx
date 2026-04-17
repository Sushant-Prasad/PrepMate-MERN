// src/pages/Profile.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  useUserProfile,
  useUploadProfilePhoto,
  useDeleteProfilePhoto,
} from "@/services/profileServices";
import { format } from "date-fns";
import axios from "axios";
import {
  Calendar,
  Users,
  Trophy,
  Flame,
  Clock,
  Target,
  DoorOpen,
  Camera,
  Trash2,
} from "lucide-react";

/* Small default avatar SVG used when user has no profileImage */
function DefaultAvatar({ size = 72 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Default user avatar"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100%" height="100%" rx="12" fill="#E6EEF8" />
      <g transform="translate(4,4)" fill="none" fillRule="evenodd">
        <circle cx="8" cy="5.5" r="3.2" fill="#1E3A8A" opacity="0.95" />
        <path
          d="M0.5,16 C0.5,12 4.5,9.5 8.5,9.5 C12.5,9.5 16.5,12 16.5,16"
          stroke="#1E3A8A"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.95"
        />
      </g>
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, color = "blue" }) {
  const colorConfig = {
    blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", value: "text-blue-900", label: "text-blue-700" },
    green: { bg: "bg-cyan-50", border: "border-cyan-200", icon: "text-cyan-600", value: "text-cyan-900", label: "text-cyan-700" },
    orange: { bg: "bg-slate-50", border: "border-slate-200", icon: "text-slate-600", value: "text-slate-900", label: "text-slate-700" },
    purple: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-600", value: "text-indigo-900", label: "text-indigo-700" },
    red: { bg: "bg-gray-50", border: "border-gray-200", icon: "text-gray-600", value: "text-gray-900", label: "text-gray-700" },
  };

  const config = colorConfig[color];

  return (
    <div className={`relative rounded-2xl p-6 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 ${config.bg} ${config.border}`}>
      <div className="relative z-10 flex flex-col items-center text-center">
        <Icon className={`w-8 h-8 ${config.icon} mb-3`} />
        <div className={`text-4xl font-black mb-2 ${config.value}`}>{value}</div>
        <div className={`text-sm font-semibold ${config.label}`}>{label}</div>
      </div>
    </div>
  );
}

function ActivityItem({ activity, index }) {
  const solvedAt = activity?.solvedAt ? new Date(activity.solvedAt) : null;
  const solvedAtText =
    solvedAt && !Number.isNaN(solvedAt.getTime())
      ? format(solvedAt, "dd/MM/yyyy HH:mm")
      : "—";

  const isDSA = activity?.type === "dsa";
  const typeColor = isDSA
    ? "bg-blue-100 text-blue-800"
    : "bg-green-100 text-green-800";

  const displayText =
    activity?.displayText || `Question ID: ${activity?.questionId || "—"}`;

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-gray-600">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${typeColor}`}
            >
              {activity?.type ? activity.type.toUpperCase() : "ACTIVITY"}
            </span>
          </div>
          <div
            className="text-sm text-gray-700 font-medium truncate mb-1"
            title={displayText}
          >
            {displayText}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {solvedAtText}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  // get logged-in user from localStorage
  let currentUser = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) currentUser = JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to parse user from localStorage", e);
  }

  const userId =
    currentUser?.id || currentUser?._id || currentUser?.userId || null;

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            You must be logged in to view your profile.
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // fetch profile for current user
  const { data, isLoading, isError, error } = useUserProfile(userId, {
    enabled: !!userId,
  });
  const { mutate: uploadPhoto, isPending: uploading } = useUploadProfilePhoto();
  const { mutate: deletePhoto } = useDeleteProfilePhoto();
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    uploadPhoto(file);
  };
  const handleDeletePhoto = () => {
    deletePhoto();
  };

  const profile = useMemo(() => {
    if (!data) return null;
    // service might return { success, data: {...} }
    if (data?.data && typeof data.data === "object") return data.data;
    return data;
  }, [data]);

  // local enriched recent activity state
  const [enrichedRecent, setEnrichedRecent] = useState([]);

  // axios instance — match your API base
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
    withCredentials: true,
    timeout: 10000,
  });

  // Enrich recentActivity: fetch question details for each activity item
  useEffect(() => {
    let cancelled = false;

    const enrich = async () => {
      if (
        !profile ||
        !Array.isArray(profile.recentActivity) ||
        profile.recentActivity.length === 0
      ) {
        setEnrichedRecent([]);
        return;
      }

      // limit to first N activities for performance
      const items = profile.recentActivity.slice(0, 8);

      const promises = items.map(async (act) => {
        const out = { ...act };
        const qId = act?.questionId;
        if (!qId) {
          out.displayText = act?.type ? act.type.toUpperCase() : "ACTIVITY";
          return out;
        }

        try {
          if (act?.type === "dsa") {
            const res = await api.get(
              `/dsa-questions/${encodeURIComponent(qId)}`,
            );
            const q = res?.data?.data ?? res?.data;
            const title = q?.title || q?.question || `Question ID: ${qId}`;
            out.displayText = title;
            out.questionTitle = title;
          } else {
            const res = await api.get(
              `/aptitude-questions/${encodeURIComponent(qId)}`,
            );
            const q = res?.data?.data ?? res?.data;
            const statement =
              q?.statement || q?.question || `Question ID: ${qId}`;
            out.displayText = statement;
            out.questionStatement = statement;
          }
        } catch (err) {
          out.displayText = `${act?.type?.toUpperCase() || "QUESTION"} ID: ${qId}`;
        }
        return out;
      });

      try {
        const results = await Promise.all(promises);
        if (!cancelled) setEnrichedRecent(results);
      } catch (err) {
        if (!cancelled) {
          const fallback = profile.recentActivity.slice(0, 8).map((act) => ({
            ...act,
            displayText: act?.type
              ? `${act.type.toUpperCase()} ID: ${act.questionId || "—"}`
              : `ID: ${act.questionId || "—"}`,
          }));
          setEnrichedRecent(fallback);
        }
      }
    };

    enrich();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-gray-600">
            {error?.message || "Unknown error occurred"}
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-600">No profile found.</p>
        </div>
      </div>
    );
  }

  const {
    name,
    profileImage,
    dsaStreak = { currentStreak: 0, bestStreak: 0, lastSolvedDate: null },
    aptitudeStreak = { currentStreak: 0, bestStreak: 0, lastSolvedDate: null },
    recentActivity = [],
    joinedGroups = [],
  } = profile;

  const lastDSADate =
    dsaStreak?.lastSolvedDate &&
    !Number.isNaN(new Date(dsaStreak.lastSolvedDate).getTime())
      ? format(new Date(dsaStreak.lastSolvedDate), "dd/MM/yyyy")
      : "—";

  const lastAptDate =
    aptitudeStreak?.lastSolvedDate &&
    !Number.isNaN(new Date(aptitudeStreak.lastSolvedDate).getTime())
      ? format(new Date(aptitudeStreak.lastSolvedDate), "dd/MM/yyyy")
      : "—";

  const recent = Array.isArray(enrichedRecent) ? enrichedRecent : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03c6f7c9] via-[#F5FCFF] to-[#7859dd]">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden mb-8 border border-white/50">
          <div className="bg-gradient-to-r from-[var(--brand-secondary)] via-[var(--brand-primary)] to-[#6EDBF0] h-40 sm:h-48" />
          <div className="relative px-6 sm:px-8 md:px-10 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 -mt-24">
              <div className="relative">
                <div className="relative group">
                  {/* Avatar */}
                  <div className="w-40 h-40 sm:w-48 sm:h-48 border-4 border-white rounded-3xl overflow-hidden bg-white shadow-2xl">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={`${name}'s avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                        <DefaultAvatar size={140} />
                      </div>
                    )}
                  </div>

                  {/* Upload Icon */}
                  <label className="absolute bottom-3 right-3 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] p-3 rounded-full text-white cursor-pointer shadow-lg hover:shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Camera size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Delete Icon */}
                  {profileImage && (
                    <button
                      onClick={handleDeletePhoto}
                      className="absolute top-3 right-3 bg-red-500 p-3 rounded-full text-white shadow-lg hover:shadow-2xl hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-center sm:text-left flex-1">
                <h1 className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] mb-2">
                  {name}
                </h1>
                <p className="text-gray-600 font-medium text-lg">Welcome to your profile</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Section (left, wider) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Your Progress
              </h2>

              {/* DSA Stats */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  DSA Performance
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard
                    icon={Flame}
                    label="Current Streak"
                    value={dsaStreak?.currentStreak ?? 0}
                    color="blue"
                  />
                  <StatCard
                    icon={Trophy}
                    label="Best Streak"
                    value={dsaStreak?.bestStreak ?? 0}
                    color="purple"
                  />
                  <div className="col-span-2 md:col-span-1">
                    <div className="relative rounded-2xl p-6 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-blue-50 border-2 border-blue-200 flex flex-col items-center text-center h-full justify-center">
                      <div className="relative z-10">
                        <Calendar className="w-8 h-8 text-blue-600 mb-3 mx-auto" />
                        <div className="text-2xl font-black text-blue-900 mb-2">
                          {lastDSADate}
                        </div>
                        <div className="text-sm font-semibold text-blue-700">
                          Last Solved
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aptitude Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  Aptitude Performance
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard
                    icon={Flame}
                    label="Current Streak"
                    value={aptitudeStreak?.currentStreak ?? 0}
                    color="green"
                  />
                  <StatCard
                    icon={Trophy}
                    label="Best Streak"
                    value={aptitudeStreak?.bestStreak ?? 0}
                    color="orange"
                  />
                  <div className="col-span-2 md:col-span-1">
                    <div className="relative rounded-2xl p-6 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-indigo-50 border-2 border-indigo-200 flex flex-col items-center text-center h-full justify-center">
                      <div className="relative z-10">
                        <Calendar className="w-8 h-8 text-indigo-600 mb-3 mx-auto" />
                        <div className="text-2xl font-black text-indigo-900 mb-2">
                          {lastAptDate}
                        </div>
                        <div className="text-sm font-semibold text-indigo-700">
                          Last Solved
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Joined Rooms moved below progress */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <DoorOpen className="w-6 h-6 text-indigo-500" />
                  Joined Groups
                </h2>
                <a
                  href="/rooms"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Manage
                </a>
              </div>

              {Array.isArray(joinedGroups) && joinedGroups.length > 0 ? (
                <ul className="space-y-3">
                  {joinedGroups.map((group) => (
                    <li
                      key={group._id}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Group Avatar */}
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-300 text-slate-600 overflow-hidden font-semibold flex-shrink-0">
                          {group.groupImage ? (
                            <img
                              src={group.groupImage}
                              alt={group.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            group.name?.[0]?.toUpperCase()
                          )}
                        </div>

                        {/* Group Info */}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm md:text-base font-semibold text-gray-900 truncate">
                            {group.name}
                          </div>

                          <div className="text-xs md:text-sm text-gray-600 flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {group.members} members
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DoorOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-gray-600 font-medium mb-2">You haven't joined any groups yet</div>
                  <a
                    href="/rooms"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Explore Study Rooms
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Recent Activity */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-500" />
                Recent Activity
              </h2>

              {recent.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">No recent activity</p>
                  <p className="text-gray-500 text-sm">
                    Start solving questions to see your progress here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.map((activity, index) => (
                    <ActivityItem
                      key={index}
                      activity={activity}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
