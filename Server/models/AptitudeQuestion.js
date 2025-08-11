import mongoose from "mongoose";

const aptitudeQuestionSchema = new mongoose.Schema(
  {
    statement: {
      type: String,
      required: [true, "Question statement is required"],
      trim: true,
    },
    options: {
      type: Map,
      of: String, // key: "A", "B", "C", "D" | value: option text
      required: [true, "Options are required"],
      validate: {
        validator: function (v) {
          return v.size >= 2;
        },
        message: "At least two options are required",
      },
    },
    answer: {
      type: String, // e.g., "A", "B", "C", "D"
      required: [true, "Correct answer is required"],
      enum: ["A", "B", "C", "D"], // Limit answer choices
    },
    solution: {
      type: String, // Detailed explanation for the answer
      required: [true, "Solution explanation is required"],
    },
    companyTags: {
      type: [String], // e.g., ["TCS", "Amazon"]
      default: [],
    },
    category: {
      type: String,
      enum: ["Numerical Ability", "Reasoning", "Verbal Ability"],
      required: true,
    },
    subCategory: {
      type: String, // e.g., "Percentages", "LCM & HCF"
      required: true,
    },
    expectedTime: {
      type: Number, // Time to solve in seconds (e.g., 60, 120)
      default: 60,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AptitudeQuestion", aptitudeQuestionSchema);
