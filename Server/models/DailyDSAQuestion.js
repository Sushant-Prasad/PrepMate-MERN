import mongoose from "mongoose";

const dailyDSAQuestionSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DSAQuestion",
    required: true,
  },
  date: { type: Date, required: true, unique: true }, // ensures one per day
});

export default mongoose.model("DailyDSAQuestion", dailyDSAQuestionSchema);
