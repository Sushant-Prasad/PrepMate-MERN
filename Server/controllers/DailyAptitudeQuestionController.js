// controllers/DailyAptitudeQuestionController.js
import DailyAptitudeQuestion from "../models/DailyAptitudeQuestion.js";
import AptitudeQuestion from "../models/AptitudeQuestion.js";
import cron from "node-cron";

/**
 * Core logic: assigns a random daily aptitude question
 */
export const assignDailyAptitudeService = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already assigned
  const existing = await DailyAptitudeQuestion.findOne({ date: today });
  if (existing) {
    return { success: false, message: "Daily question already assigned for today." };
  }

  const count = await AptitudeQuestion.countDocuments();
  if (count === 0) {
    return { success: false, message: "No aptitude questions available." };
  }

  const random = Math.floor(Math.random() * count);
  const randomQuestion = await AptitudeQuestion.findOne().skip(random);

  const dailyQuestion = await DailyAptitudeQuestion.create({
    questionId: randomQuestion._id,
    date: today,
  });

  return { success: true, dailyQuestion };
};

/**
 * Route handler for Express
 */
export const assignDailyAptitudeQuestion = async (req, res) => {
  try {
    const result = await assignDailyAptitudeService();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      message: "Daily aptitude question assigned successfully!",
      dailyQuestion: result.dailyQuestion,
    });
  } catch (error) {
    console.error("Error assigning daily aptitude:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Get today's daily aptitude question
 */
export const getTodayDailyAptitude = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyQuestion = await DailyAptitudeQuestion.findOne({ date: today }).populate("questionId");

    if (!dailyQuestion) {
      return res.status(404).json({ message: "No daily aptitude question assigned yet." });
    }

    res.status(200).json(dailyQuestion);
  } catch (error) {
    console.error("Error fetching today's daily aptitude:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Run at midnight daily (00:00)
cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running daily aptitude assignment cron...");
  try {
    const result = await assignDailyAptitudeService();
    if (result.success) {
      console.log("✅ Daily Aptitude assigned:", result.dailyQuestion._id);
    } else {
      console.log("⚠️ Skipped:", result.message);
    }
  } catch (err) {
    console.error("❌ Cron job failed:", err);
  }
});
