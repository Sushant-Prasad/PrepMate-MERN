import mongoose from "mongoose";

const userAptitudeSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to authentication model
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AptitudeQuestion", // Which question was attempted
      required: true,
    },
    selectedOption: {
      type: String, // "A", "B", "C", or "D"
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    mode: {
      type: String,
      enum: ["streak", "practice"], // Was it a daily challenge or normal practice?
      default: "practice",
    },
    timeTaken: {
      type: Number, // Time taken in seconds
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserAptitudeSubmission", userAptitudeSubmissionSchema);
