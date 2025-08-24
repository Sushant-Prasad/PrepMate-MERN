// controllers/aptitude.controller.js
import mongoose from "mongoose";
import UserAptitudeSubmission from "../models/UserAptitudeSubmission.js";
import AptitudeQuestion from "../models/AptitudeQuestion.js";
import UserProfile from "../models/UserProfile.js";

/* ---------------------------------------------
   ✅ Always log recent activity (atomic, race-safe)
   - Inserts at front
   - Keeps only latest 10
   - No-ops if profile missing (ensure you create on register/login)
----------------------------------------------*/
const logRecentAptitudeActivity = async (userId, questionId) => {
  await UserProfile.updateOne(
    { userId },
    {
      $push: {
        recentActivity: {
          $each: [{ type: "aptitude", questionId, solvedAt: new Date() }],
          $position: 0,
          $slice: 10,
        },
      },
    }
  );
};

/* ---------------------------------------------
   🔥 Update Aptitude streak ONLY (no activity push)
   - One increment per day
   - Continues if solved yesterday, else resets to 1
----------------------------------------------*/
const updateAptitudeStreak = async (userId) => {
  const profile = await UserProfile.findOne({ userId });
  if (!profile) return null;

  const streak = profile.aptitudeStreak || {
    currentStreak: 0,
    bestStreak: 0,
    lastSolvedDate: null,
  };

  const today = new Date().toDateString();
  const lastDate = streak.lastSolvedDate
    ? new Date(streak.lastSolvedDate).toDateString()
    : null;

  if (lastDate === today) {
    // already solved today → no change
  } else if (lastDate === new Date(Date.now() - 86400000).toDateString()) {
    streak.currentStreak += 1; // continue streak
  } else {
    streak.currentStreak = 1; // reset/start streak
  }

  streak.bestStreak = Math.max(streak.bestStreak, streak.currentStreak);
  streak.lastSolvedDate = new Date();

  profile.aptitudeStreak = streak;
  await profile.save();
  return profile.aptitudeStreak;
};

/* ---------------------------------------------
   POST /api/aptitude/submit
   - Saves submission if correct
   - ALWAYS logs recent activity
   - Updates streak ONLY when mode === "streak"
----------------------------------------------*/
export const submitAptitudeAnswer = async (req, res) => {
  try {
    const authUserId = req.user?.id || req.body.userId; // prefer JWT user id
    const { questionId, selectedOption, mode = "practice", timeTaken } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(authUserId) ||
      !mongoose.Types.ObjectId.isValid(questionId)
    ) {
      return res.status(400).json({ message: "Invalid userId or questionId" });
    }

    const question = await AptitudeQuestion.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found." });

    // Adjust this if your model uses solutionIndex/options
    const isCorrect = question.answer === selectedOption;

    if (!isCorrect) {
      return res.status(200).json({
        message: "Incorrect answer. Submission not saved.",
        isCorrect: false,
      });
    }

    // Save correct submission
    const submission = await UserAptitudeSubmission.create({
      userId: authUserId,
      questionId,
      selectedOption,
      isCorrect: true,
      mode,
      timeTaken,
    });

    // 🌟 ALWAYS log recent activity (practice or streak)
    await logRecentAptitudeActivity(authUserId, questionId);

    // 🔥 Update streak ONLY if 'streak' mode
    let streak = null;
    if (mode === "streak") {
      streak = await updateAptitudeStreak(authUserId);
    }

    return res.status(201).json({
      message: "Correct answer! Submission recorded successfully",
      submission,
      streak, // aptitudeStreak (or null if not streak mode)
    });
  } catch (error) {
    console.error("Error in submitAptitudeAnswer:", error);
    return res.status(500).json({ message: "Server error", error: error.message || error });
  }
};

/* ---------------------------------------------
   GET /api/aptitude/submissions/:userId
----------------------------------------------*/
export const getUserSubmissions = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const submissions = await UserAptitudeSubmission.find({ userId })
      .populate({ path: "questionId", select: "title" })
      .sort({ createdAt: -1 });

    return res.status(200).json(submissions);
  } catch (error) {
    console.error("Error in getUserSubmissions:", error);
    return res.status(500).json({ message: "Server error", error: error.message || error });
  }
};

/* ---------------------------------------------
   GET /api/aptitude/submissions/streak/:userId
----------------------------------------------*/
export const getUserStreakSubmissions = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const submissions = await UserAptitudeSubmission.find({ userId, mode: "streak" })
      .populate({ path: "questionId", select: "title" })
      .sort({ createdAt: -1 });

    return res.status(200).json(submissions);
  } catch (error) {
    console.error("Error in getUserStreakSubmissions:", error);
    return res.status(500).json({ message: "Server error", error: error.message || error });
  }
};
