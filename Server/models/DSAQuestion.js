import mongoose from "mongoose";

/**
 * Subdocument schema for each test case
 * - Represents a single input-output pair to validate submissions.
 */
const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
  },
  output: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
  },
});

/**
 * Subdocument schema for starter code
 * - Stores initial boilerplate code for each supported language.
 */
const starterCodeSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
});

/**
 * Main schema for DSA questions
 * - Stores complete metadata for each coding problem.
 */
const dsaQuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    constraints: {
      type: String,
      required: true,
    },

    inputFormat: {
      type: String,
      required: true,
    },

    outputFormat: {
      type: String,
      required: true,
    },

    /**
     * Sample/Public test cases
     */
    testCases: [testCaseSchema],

    /**
     * Starter code for each language
     */
    starterCode: {
      type: [starterCodeSchema],
      default: [],
    },

    /**
     * Reference solution
     */
    solution: {
      type: String,
      required: true,
    },

    /**
     * Problem tags
     */
    tags: {
      type: [String],
      default: [],
    },

    /**
     * Company tags
     */
    companyTags: {
      type: [String],
      default: [],
    },

    /**
     * Execution limits
     */
    timeLimit: {
      type: Number,
      default: 1,
    },

    memoryLimit: {
      type: Number,
      default: 256,
    },

    /**
     * Supported programming languages
     */
    languagesSupported: {
      type: [String],
      default: ["javascript", "python", "cpp", "java"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("DSAQuestion", dsaQuestionSchema);