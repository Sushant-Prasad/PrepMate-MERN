// controllers/AptitudeQuestionController.js
import AptitudeQuestion from "../models/AptitudeQuestion.js";

/**
 * Create a new aptitude question
 */
export const createAptiQuestion = async (req, res) => {
  try {
    const question = new AptitudeQuestion(req.body);
    await question.save();
    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: question,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create question",
      error: error.message,
    });
  }
};

/**
 * Get all aptitude questions (with optional filters)
 */
export const getAptiQuestions = async (req, res) => {
  try {
    const { category, subCategory, company } = req.query;

    let filter = {};
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (company) filter.companyTags = company;

    const questions = await AptitudeQuestion.find(filter);
    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
      error: error.message,
    });
  }
};

/**
 * Get a single question by ID
 */
export const getAptiQuestionById = async (req, res) => {
  try {
    const question = await AptitudeQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch question",
      error: error.message,
    });
  }
};

/**
 * Delete a question by ID
 */
export const deleteAptiQuestion = async (req, res) => {
  try {
    const question = await AptitudeQuestion.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete question",
      error: error.message,
    });
  }
};
