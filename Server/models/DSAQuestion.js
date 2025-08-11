import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String }
});

const starterCodeSchema = new mongoose.Schema({
  language: { type: String, required: true }, // e.g., "javascript", "python", "cpp"
  code: { type: String, required: true }
});

const dsaQuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true
    },
    constraints: {
      type: String,
      required: true
    },
    inputFormat: {
      type: String,
      required: true
    },
    outputFormat: {
      type: String,
      required: true
    },
    testCases: [testCaseSchema],
    starterCode: [starterCodeSchema], // Different starter code per language
    solution: {
      type: String, // Official solution in any default language
      required: true
    },
    tags: [{ type: String }],
    companyTags: [{ type: String }],
    timeLimit: {
      type: Number,
      default: 1 // in seconds
    },
    memoryLimit: {
      type: Number,
      default: 256 // in MB
    },
    languagesSupported: [{ type: String }], // e.g., ["javascript", "python", "cpp"]
  },
  {
    timestamps: true
  }
);

export default mongoose.model("DSAQuestion", dsaQuestionSchema);
