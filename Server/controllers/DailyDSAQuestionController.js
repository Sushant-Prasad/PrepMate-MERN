import DailyDSAQuestion from "../models/DailyDSAQuestion.js";
import DSAQuestion from "../models/DSAQuestion.js";
import cron from "node-cron";

/**
 * @desc Get today's Daily DSA Question
 * @route GET /api/daily-dsa
 * @access Public
 */
export const getTodayDailyDSA = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for comparison

    const dailyQuestion = await DailyDSAQuestion.findOne({
      date: today,
    }).populate("questionId");

    if (!dailyQuestion) {
      return res.status(404).json({
        success: false,
        message: "No daily DSA question assigned yet",
      });
    }

    res.status(200).json({ success: true, data: dailyQuestion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Assign a random DSA question as today's daily challenge
 * This runs automatically at midnight via cron job
 */
const assignDailyDSAQuestion = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Keep date normalized

    // Check if today's question is already assigned
    const existing = await DailyDSAQuestion.findOne({ date: today });
    if (existing) {
      console.log(`Daily DSA for ${today.toDateString()} already assigned`);
      return;
    }

    const questions = await DSAQuestion.find();
    if (!questions.length) {
      console.log("No DSA questions available to assign!");
      return;
    }

    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];

    await DailyDSAQuestion.create({
      date: today,
      questionId: randomQuestion._id,
    });

    console.log(
      `Daily DSA assigned for ${today.toDateString()}: ${randomQuestion.title}`
    );
  } catch (error) {
    console.error(" Error assigning daily DSA:", error.message);
  }
};

// Schedule the job to run at midnight (server time)
cron.schedule("0 0 * * *", assignDailyDSAQuestion, {
  timezone: "Asia/Kolkata",
});

export default assignDailyDSAQuestion;
