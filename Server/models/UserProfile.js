import mongoose from "mongoose";

const { Schema } = mongoose;

const userProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    profileImage: { type: String },

    // Streaks
    dsaStreak: {
      currentStreak: { type: Number, default: 0 },
      bestStreak: { type: Number, default: 0 },
      lastSolvedDate: { type: Date },
    },
    aptitudeStreak: {
      currentStreak: { type: Number, default: 0 },
      bestStreak: { type: Number, default: 0 },
      lastSolvedDate: { type: Date },
    },

    // Recent activity (latest solved questions)
    recentActivity: [
      {
        type: { type: String, enum: ["dsa", "aptitude"] },
        questionId: { type: Schema.Types.ObjectId },
        solvedAt: { type: Date, default: Date.now },
      },
    ],

    joinedRooms: [{ type: Schema.Types.ObjectId, ref: "StudyRoom" }],
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

export default mongoose.model("UserProfile", userProfileSchema);
