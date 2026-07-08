import { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import ConfirmDialog from "./ui/ConfirmDialog.jsx";
import UserSearch from "./UserSearch";
import toast from "react-hot-toast";
import { Camera, Trash2, UserPlus } from "lucide-react";

const getId = (value) => value?._id?.toString?.() || value?.toString?.() || "";

export default function GroupInfo() {
  const {
    user,
    activeConversation,
    editGroup,
    updateGroupPhoto,
    deleteGroupPhoto,
    addMember,
    kickMember,
    deleteGroup,
    setShowGroupInfo,
  } = useContext(ChatContext);

  const [name, setName] = useState(activeConversation?.name || "");
  const [saving, setSaving] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({});
  const confirmResolverRef = useRef(null);
  const panelRef = useRef(null);
  const activeGroupId = activeConversation?._id?.toString();
  const activeGroupName = activeConversation?.name || "";

  const refreshPanel = () => {
    panelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setName(activeGroupName);
  }, [activeGroupId, activeGroupName]);

  function showConfirm(config) {
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmConfig(config);
      setConfirmOpen(true);
    });
  }

  function handleConfirmOk() {
    setConfirmOpen(false);
    confirmResolverRef.current?.(true);
  }

  function handleConfirmCancel() {
    setConfirmOpen(false);
    confirmResolverRef.current?.(false);
  }

  if (!activeConversation) return null;

  const adminId = getId(activeConversation.admin);
  const userId = getId(user);
  const isAdmin = adminId === userId;

  const handleSave = async () => {
    setSaving(true);
    try {
      await editGroup({
        groupId: activeConversation._id,
        name,
      });
      toast.success("Group updated successfully!");
      refreshPanel();
    } catch {
      toast.error("Failed to update group");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;

    setPhotoLoading(true);
    try {
      await updateGroupPhoto(activeConversation._id, file);
      toast.success("Group photo updated successfully!");
      refreshPanel();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update group photo");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    const ok = await showConfirm({
      title: "Delete Group Photo",
      message: "Remove the current group photo and restore the default image?",
      confirmText: "Delete",
      variant: "danger",
    });

    if (!ok) return;

    setPhotoLoading(true);
    try {
      await deleteGroupPhoto(activeConversation._id);
      toast.success("Group photo deleted successfully!");
      refreshPanel();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete group photo");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = await showConfirm({
      title: "Delete Group",
      message: "Are you sure you want to permanently delete this group? This cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    await deleteGroup(activeConversation._id);
    setShowGroupInfo(false);
  };

  const handleAddMember = async (member) => {
    if (!member?._id || addingMember) return;

    const isAlreadyMember = (activeConversation.participants || []).some(
      (participant) => getId(participant) === member._id.toString()
    );

    if (isAlreadyMember) {
      toast.error("User is already in this group");
      return;
    }

    setAddingMember(true);
    try {
      await addMember(activeConversation._id, member._id);
      toast.success(`${member.name || "User"} added to group`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const uniqueParticipants = Array.from(
    new Map((activeConversation.participants || []).map((p) => [getId(p), p])).values()
  );

  const currentImage = activeConversation.groupImage || "/default-group.png";

  return (
    <div ref={panelRef} className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-primary)_7%,white),white)] p-4 sm:p-6">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-card/95 p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setShowGroupInfo(false)}
            className="rounded-md border border-border px-2 py-1 text-sm font-semibold text-[var(--brand-secondary)] transition-colors hover:bg-accent"
          >
            Back
          </button>
          <h2 className="text-xl font-bold text-[var(--brand-secondary)] sm:text-2xl">Group Info</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-border bg-background p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--brand-secondary)]">
                  Group Photo
                </h3>
              </div>
            </div>

            <div className="relative mx-auto h-24 w-24 group sm:h-32 sm:w-32">
              <img
                src={currentImage}
                className="h-full w-full rounded-full border border-border object-cover"
                alt="Group"
              />

              {isAdmin && (
                <>
                  <label className="absolute bottom-2 right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-primary)] text-[var(--brand-secondary)] shadow-lg opacity-0 transition-opacity duration-200 hover:bg-[var(--brand-secondary)] hover:text-white group-hover:opacity-100">
                    {photoLoading ? <span className="text-[10px] font-bold">...</span> : <Camera className="h-4 w-4" />}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        handlePhotoUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </label>

                  {currentImage !== "/default-group.png" && (
                    <button
                      onClick={handleDeletePhoto}
                      disabled={photoLoading}
                      className="absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-lg opacity-0 transition-opacity duration-200 hover:bg-red-700 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-background p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--brand-secondary)]">
                Group Name
              </h3>
            </div>

            <input
              value={name}
              disabled={!isAdmin}
              onChange={(e) => setName(e.target.value)}
              className="mb-4 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--brand-primary)_30%,white)]"
            />

            {isAdmin && (
              <div className="sticky bottom-0 -mx-4 mt-2 border-t border-border bg-background/95 px-4 pt-4 backdrop-blur-sm">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full rounded-lg bg-[var(--brand-primary)] py-2 font-semibold text-[var(--brand-secondary)] transition-colors hover:bg-[var(--brand-secondary)] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="mt-6 mb-2 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-[var(--brand-secondary)]">Participants</h3>
          {isAdmin && addingMember && (
            <span className="text-xs font-medium text-muted-foreground">Adding...</span>
          )}
        </div>

        {isAdmin && (
          <div className="mb-4 rounded-lg border border-border bg-background p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--brand-secondary)]">
              <UserPlus className="h-4 w-4" />
              Add Member
            </div>
            <UserSearch mode="modal" onSelect={handleAddMember} />
          </div>
        )}

        <div className="space-y-2">
          {uniqueParticipants.map((p) => (
            <div
              key={getId(p)}
              className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{p.name || p.email || "Group member"}</p>

                {getId(p) === adminId && (
                  <span className="text-xs text-[var(--brand-secondary)]">Admin</span>
                )}
              </div>

              {isAdmin && getId(p) !== userId && (
                <button
                  onClick={() => kickMember(activeConversation._id, getId(p))}
                  className="rounded-md px-2 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  Kick
                </button>
              )}
            </div>
          ))}
        </div>

        {isAdmin && (
          <button
            onClick={handleDelete}
            className="mt-6 w-full rounded-lg bg-red-600 py-2 font-semibold text-white transition-colors hover:bg-red-700"
          >
            Delete Group
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        onConfirm={handleConfirmOk}
        onCancel={handleConfirmCancel}
      />
    </div>
  );
}
