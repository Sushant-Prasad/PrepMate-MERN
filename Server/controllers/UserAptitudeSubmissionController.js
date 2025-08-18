import UserAptitudeSubmission from "../models/UserAptitudeSubmission.js";
import AptitudeQuestion from "../models/AptitudeQuestion.js";

/**
 * Submit an aptitude question answer
 */
export const submitAptitudeAnswer = async (req, res) => {
  try {
    const { userId, questionId, selectedOption, mode, timeTaken } = req.body;

    // Ensure question exists
    const question = await AptitudeQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    // Check correctness
    const isCorrect = question.answer === selectedOption; // ✅ match with your field name

    if (!isCorrect) {
      return res.status(200).json({
        message: "Incorrect answer. Submission not saved.",
        isCorrect: false,
      });
    }

    // Save submission only if correct
    const submission = await UserAptitudeSubmission.create({
      userId,
      questionId,
      selectedOption,
      isCorrect,
      mode,
      timeTaken,
    });

    res.status(201).json({
      message: "Correct answer! Submission recorded successfully",
      submission,
    });
  } catch (error) {
    console.error("Error in submitAptitudeAnswer:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


/**
 * Get all submissions of a user
 */
export const getUserSubmissions = async (req, res) => {
  try {
    const { userId } = req.params;

    const submissions = await UserAptitudeSubmission.find({ userId })
      .populate("questionId")
      .sort({ createdAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error in getUserSubmissions:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Get streak submissions only (mode = streak)
 */
export const getUserStreakSubmissions = async (req, res) => {
  try {
    const { userId } = req.params;

    const submissions = await UserAptitudeSubmission.find({ userId, mode: "streak" })
      .populate("questionId")
      .sort({ createdAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error in getUserStreakSubmissions:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
