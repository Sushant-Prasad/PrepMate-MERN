import mongoose from "mongoose";

const testCaseResultSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  actualOutput: { type: String, required: true },
  passed: { type: Boolean, required: true },
  executionTime: { type: Number }, // in milliseconds
});

const userDSASubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DSAQuestion",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "wrong-answer",
        "runtime-error",
        "time-limit-exceeded",
        "compilation-error",
      ],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isDailyChallenge: {
      type: Boolean,
      default: false,
    },

    // Detailed execution results
    testCaseResults: [testCaseResultSchema],

    executionSummary: {
      totalTestCases: { type: Number, default: 0 },
      passedCount: { type: Number, default: 0 },
      failedCount: { type: Number, default: 0 },
      executionTime: { type: Number }, // in ms
      memoryUsed: { type: Number }, // in KB/MB
    },

    errorLogs: {
      compilationError: { type: String }, // if compilation fails
      runtimeError: { type: String }, // if runtime error occurs
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("UserDSASubmission", userDSASubmissionSchema);
