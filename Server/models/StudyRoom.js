import mongoose from "mongoose";

/**
 * StudyRoom Schema
 * ----------------
 * Represents a group where users can collaborate, share resources, and chat.
 * 
 * Key Features:
 *  - Each room has a creator (admin)
 *  - Users can join as members or be promoted to admin
 *  - Supports storing links to study resources (e.g., PDFs, videos)
 *  - Can be extended to connect with a "Message" model for group chats
 */
const studyRoomSchema = new mongoose.Schema(
  {
    // Name of the study room (must be provided, trimmed to remove extra spaces)
    name: { type: String, required: true, trim: true },

    // Optional description about the purpose/topic of the room
    description: { type: String, trim: true },

    // Reference to the profile of the user who created the room
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile", // We use UserProfile instead of UserAuth for display purposes
      required: true,
    },

    /**
     * Array of members in the study room
     * - userId: Reference to UserProfile
     * - role: Either "admin" or "member"
     * - joinedAt: Date when they joined
     */
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserProfile",
          required: true,
        },
        role: { type: String, enum: ["admin", "member"], default: "member" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],

    /**
     * Array of study resources shared within the room
     * - title: Name of the resource (e.g., "DSA Cheatsheet")
     * - link: Optional URL to the resource (Google Drive, Dropbox, etc.)
     * - uploadedBy: Reference to the uploader's UserProfile
     * - uploadedAt: Date when the resource was uploaded
     */
    studyResources: [
      {
        title: { type: String, required: true },
        link: { type: String },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserProfile",
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt fields
);

export default mongoose.model("StudyRoom", studyRoomSchema);
