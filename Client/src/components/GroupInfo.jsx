import { useContext, useRef, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import ConfirmDialog from "./ui/ConfirmDialog.jsx";
import toast from "react-hot-toast";
// import { AuthContext } from "../context/AuthContext";

export default function GroupInfo() {
    const {
        user,
        activeConversation,
        editGroup,
        kickMember,
        deleteGroup,
        setShowGroupInfo
    } = useContext(ChatContext);

    // const { user } = useContext(AuthContext);

    const [name, setName] = useState(activeConversation.name);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // custom confirm dialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({});
    const confirmResolverRef = useRef(null);
    function showConfirm(config) {
      return new Promise((resolve) => {
        confirmResolverRef.current = resolve;
        setConfirmConfig(config);
        setConfirmOpen(true);
      });
    }
    function handleConfirmOk() { setConfirmOpen(false); confirmResolverRef.current?.(true); }
    function handleConfirmCancel() { setConfirmOpen(false); confirmResolverRef.current?.(false); }

    const isAdmin =
  activeConversation.admin?._id?.toString() === user?._id?.toString();

    const handleSave = async () => {
        setLoading(true);
        try {
            await editGroup({
                groupId: activeConversation._id,
                name,
                image
            });
            toast.success("Group updated successfully!");
        } catch {
            toast.error("Failed to update group");
        }
        setLoading(false);
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


    const uniqueParticipants = Array.from(
        new Map(
            activeConversation.participants.map(p => [p._id, p])
        ).values()
    );


    return (
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-primary)_7%,white),white)] p-4 sm:p-6">
            <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-card/95 p-4 shadow-sm sm:p-6">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3 sm:gap-4">
                <button
                    onClick={() => setShowGroupInfo(false)}
                    className="rounded-md border border-border px-2 py-1 text-sm font-semibold text-[var(--brand-secondary)] transition-colors hover:bg-accent"
                >
                    Back
                </button>
                <h2 className="text-xl font-bold text-[var(--brand-secondary)] sm:text-2xl">Group Info</h2>
            </div>

            {/* Group Image */}
            <img
                src={activeConversation.groupImage || "/default-group.png"}
                className="mx-auto mb-4 h-24 w-24 rounded-full border border-border object-cover sm:h-32 sm:w-32"
                alt="Group"
            />

            {isAdmin && (
                <input
                    type="file"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="mx-auto mb-4 block w-full max-w-xs text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-[var(--brand-primary)] file:px-3 file:py-2 file:font-semibold file:text-[var(--brand-secondary)]"
                />
            )}

            {/* Name */}
            <input
                value={name}
                disabled={!isAdmin}
                onChange={(e) => setName(e.target.value)}
                className="mb-4 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--brand-primary)_30%,white)]"
            />

            {isAdmin && (
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="mb-6 w-full rounded-lg bg-[var(--brand-primary)] py-2 font-semibold text-[var(--brand-secondary)] transition-colors hover:bg-[var(--brand-secondary)] hover:text-white"
                >
                    Save Changes
                </button>
            )}

            {/* Members */}
            <h3 className="mb-2 font-semibold text-[var(--brand-secondary)]">Participants</h3>
            <div className="space-y-2">
                {uniqueParticipants.map(p => (
                    <div
                        key={p._id}
                        className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
                    >
                        <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{p.name}</p>

                            {p._id?.toString() === activeConversation.admin?._id?.toString() && (
                                <span className="text-xs text-[var(--brand-secondary)]">Admin</span>
                            )}
                        </div>

                        {isAdmin && p._id !== user._id && (
                            <button
                                onClick={() => kickMember(activeConversation._id, p._id)}
                                className="rounded-md px-2 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                            >
                                Kick
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Delete */}
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
