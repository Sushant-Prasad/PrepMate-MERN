import mongoose from "mongoose";

const dailyAptitudeQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AptitudeQuestion", // Links to the aptitude question model
      required: true,
    },
    date: {
      type: Date,
      required: true,
      unique: true, // Prevent multiple daily challenges for the same date
    },
  },
  { timestamps: true }
);

export default mongoose.model("DailyAptitudeQuestion", dailyAptitudeQuestionSchema);
