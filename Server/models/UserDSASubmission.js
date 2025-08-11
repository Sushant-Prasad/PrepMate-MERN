import mongoose from "mongoose";

/**
 * TestCaseResult Schema
 * ----------------------
 * Stores the result of running a single test case for a user's submission.
 * - input:           The input data given to the program.
 * - expectedOutput:  The correct output expected.
 * - actualOutput:    The output produced by the user's code.
 * - passed:          Boolean indicating whether the output matched the expected result.
 * - executionTime:   Time taken to run this test case (in milliseconds).
 */
const testCaseResultSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  actualOutput: { type: String, required: true },
  passed: { type: Boolean, required: true },
  executionTime: { type: Number }, // milliseconds
});

/**
 * UserDSASubmission Schema
 * -------------------------
 * Tracks every attempt a user makes on a DSA question.
 *
 * Purpose:
 * - Store user's submitted code for a problem.
 * - Record test case results, status, and execution details.
 * - Differentiate between daily streak challenges, practice mode, and contest mode.
 */
const userDSASubmissionSchema = new mongoose.Schema(
  {
    // Reference to the user's profile (stores streak, activity, etc.)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },

    // The question this submission is for
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DSAQuestion",
      required: true,
    },

    // The actual code the user submitted
    code: {
      type: String,
      required: true,
    },

    // Programming language of the submission (e.g., "javascript", "python", "cpp")
    language: {
      type: String,
      required: true,
    },

    // Current evaluation status of the submission
    status: {
      type: String,
      enum: [
        "pending", // Not yet evaluated
        "accepted", // All test cases passed
        "wrong-answer", // Some/all test cases failed
        "runtime-error", // Error during execution
        "time-limit-exceeded", // Took longer than allowed
        "compilation-error", // Failed to compile
      ],
      default: "pending",
    },

    // Date & time of submission
    submittedAt: {
      type: Date,
      default: Date.now,
    },

    /**
     * Mode of the submission:
     * - streak: Daily challenge submission for streak tracking
     * - practice: User practicing without streak/contest context
     * - contest: Submission during a timed contest
     */
    mode: {
      type: String,
      enum: ["streak", "practice", "contest"],
      default: "practice",
    },

    // Array of detailed results for each test case
    testCaseResults: [testCaseResultSchema],

    // Summary of execution performance
    executionSummary: {
      totalTestCases: { type: Number, default: 0 },
      passedCount: { type: Number, default: 0 },
      failedCount: { type: Number, default: 0 },
      executionTime: { type: Number }, // in ms
      memoryUsed: { type: Number }, // in KB or MB
    },

    // Error details if compilation or execution failed
    errorLogs: {
      compilationError: { type: String },
      runtimeError: { type: String },
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt fields automatically
  }
);

export default mongoose.model("UserDSASubmission", userDSASubmissionSchema);
