import mongoose from "mongoose";

/**
 * Schema for storing the Daily DSA Challenge Question
 * ---------------------------------------------------
 * Purpose:
 *   - Stores the mapping between a date and the DSA question assigned for that day.
 *   - Ensures only one question is assigned per date (via unique constraint).
 *
 * Usage:
 *   - At midnight (12:01 AM), a random DSAQuestion is chosen and stored here.
 *   - The frontend or backend can fetch the daily challenge for a given date quickly.
 *   - Useful for tracking which problem was the official daily challenge for past dates.
 */
const dailyDSAQuestionSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DSAQuestion", // Reference to the original question from DSAQuestion collection
    required: true,
  },
  date: {
    type: Date,
    required: true,
    unique: true, // Ensures there’s only ONE daily question per date
  },
});

export default mongoose.model("DailyDSAQuestion", dailyDSAQuestionSchema);
