import mongoose from "mongoose";

/**
 * Subdocument schema for each test case
 * - Represents a single input-output pair to validate submissions.
 */
const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true }, // Sample input for the problem
  output: { type: String, required: true }, // Expected output for that input
  explanation: { type: String }, // Optional explanation for why output is correct
});

/**
 * Subdocument schema for starter code
 * - Stores initial boilerplate code for each supported language.
 */
const starterCodeSchema = new mongoose.Schema({
  language: { type: String, required: true }, // Programming language (e.g., "javascript", "python", "cpp")
  code: { type: String, required: true }, // The starting code snippet for this problem
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
      trim: true, // Removes extra spaces before/after
    },
    description: {
      type: String,
      required: true, // Full problem statement
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"], // Difficulty level for filtering
      required: true,
    },
    constraints: {
      type: String,
      required: true, // Constraints on input size, values, etc.
    },
    inputFormat: {
      type: String,
      required: true, // How input will be provided
    },
    outputFormat: {
      type: String,
      required: true, // Expected output format
    },
    testCases: [testCaseSchema], // List of test cases for validating solutions
    starterCode: [starterCodeSchema], // Starter code for multiple languages
    solution: {
      type: String, // Official solution in a default/preferred language
      required: true,
    },
    tags: [{ type: String }], // General tags (e.g., "array", "dynamic-programming")
    companyTags: [{ type: String }], // Company-specific tags (e.g., "Google", "Amazon")
    timeLimit: {
      type: Number,
      default: 1, // Time limit in seconds per test case
    },
    memoryLimit: {
      type: Number,
      default: 256, // Memory limit in MB
    },
    languagesSupported: [{ type: String }], // Languages allowed for submissions
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

export default mongoose.model("DSAQuestion", dsaQuestionSchema);
