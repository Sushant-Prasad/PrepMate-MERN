import mongoose from "mongoose";

const { Schema } = mongoose;

const userProfileSchema = new Schema(
{
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  profileImage: {
    type: String
  },

  // DSA streak
  dsaStreak: {
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    lastSolvedDate: { type: Date }
  },

  // Aptitude streak
  aptitudeStreak: {
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    lastSolvedDate: { type: Date }
  },

  // Recently solved questions
  recentActivity: [
    {
      type: {
        type: String,
        enum: ["dsa", "aptitude"]
      },
      questionId: {
        type: Schema.Types.ObjectId
      },
      solvedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // Groups joined by user
  joinedGroups: [
    {
      type: Schema.Types.ObjectId,
      ref: "Conversation"
    }
  ]

},
{ timestamps: true }
);

export default mongoose.model("UserProfile", userProfileSchema);