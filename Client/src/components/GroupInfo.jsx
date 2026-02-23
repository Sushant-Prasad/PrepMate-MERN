import { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";
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
            alert("Group updated");
        } catch {
            alert("Failed to update group");
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this group permanently?")) return;
        await deleteGroup(activeConversation._id);
        setShowGroupInfo(false);
    };


    const uniqueParticipants = Array.from(
        new Map(
            activeConversation.participants.map(p => [p._id, p])
        ).values()
    );


    return (
        <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => setShowGroupInfo(false)}
                    className="text-blue-500"
                >
                    ← Back
                </button>
                <h2 className="text-2xl font-bold ">Group Info</h2>
            </div>

            {/* Group Image */}
            <img
                src={activeConversation.groupImage || "/default-group.png"}
                className="w-32 h-32 rounded-full mx-auto mb-4"
            />

            {isAdmin && (
                <input
                    type="file"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="mb-4 flex mx-auto"
                />
            )}

            {/* Name */}
            <input
                value={name}
                disabled={!isAdmin}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded mb-4"
            />

            {isAdmin && (
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 rounded mb-6"
                >
                    Save Changes
                </button>
            )}

            {/* Members */}
            <h3 className="font-semibold mb-2">Participants</h3>
            <div className="space-y-2">
                {uniqueParticipants.map(p => (
                    <div
                        key={p._id}
                        className="flex justify-between items-center bg-white p-2 rounded"
                    >
                        <div>
                            <p>{p.name}</p>

                            {p._id?.toString() === activeConversation.admin?._id?.toString() && (
                                <span className="text-xs text-blue-500">Admin</span>
                            )}
                        </div>

                        {isAdmin && p._id !== user._id && (
                            <button
                                onClick={() => kickMember(activeConversation._id, p._id)}
                                className="text-red-500 text-sm"
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
                    className="w-full mt-6 bg-red-600 text-white py-2 rounded"
                >
                    Delete Group
                </button>
            )}
        </div>
    );
}
