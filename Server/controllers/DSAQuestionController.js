import DSAQuestion from "../models/DSAQuestion.js";

/**
 * @desc   Get all DSA questions
 * @route  GET /api/dsa-questions
 * @access Public / Admin (depending on your use case)
 */
export const getAllDSA = async (req, res) => {
  try {
    const questions = await DSAQuestion.find();
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Get a single DSA question by ID
 * @route  GET /api/dsa-questions/:id
 * @access Public
 */
export const getDSAById = async (req, res) => {
  try {
    const question = await DSAQuestion.findById(req.params.id);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Create a new DSA question
 * @route  POST /api/dsa-questions
 * @access Admin
 */
export const createDSA = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      constraints,
      inputFormat,
      outputFormat,
      testCases,
      starterCode,
      solution,
      tags,
      companyTags,
      timeLimit,
      memoryLimit,
      languagesSupported
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !difficulty ||
      !constraints ||
      !inputFormat ||
      !outputFormat ||
      !solution
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const question = new DSAQuestion({
      title,
      description,
      difficulty,
      constraints,
      inputFormat,
      outputFormat,
      testCases,
      starterCode,
      solution,
      tags,
      companyTags,
      timeLimit,
      memoryLimit,
      languagesSupported,
    });

    await question.save();

    return res.status(201).json({
      success: true,
      message: "DSA Question created successfully",
      data: question,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating question",
      error: error.message,
    });
  }
};
/**
 * @desc   Get DSA questions by company tag
 * @route  GET /api/dsa-questions/company/:CompanyTag
 * @access Public
 */
export const getDSAByCompanyTag = async (req, res) => {
  try {
    const { CompanyTag } = req.params;

    // Find all questions where the companyTags array contains the tag (case-insensitive)
    const questions = await DSAQuestion.find({
      companyTags: { $regex: new RegExp(`^${CompanyTag}$`, "i") }
    });

    if (!questions.length) {
      return res
        .status(404)
        .json({ success: false, message: "No questions found for this company tag" });
    }

    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * @desc   Get DSA questions by tag
 * @route  GET /api/dsa-questions/tag/:tag
 * @access Public
 */
export const getDSAByTag = async (req, res) => {
  try {
    const { tag } = req.params;

    // Find all questions where the tags array contains the tag (case-insensitive)
    const questions = await DSAQuestion.find({
      tags: { $regex: new RegExp(`^${tag}$`, "i") }
    });

    if (!questions.length) {
      return res
        .status(404)
        .json({ success: false, message: "No questions found for this tag" });
    }

    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Get DSA questions by difficulty
 * @route  GET /api/dsa-questions/difficulty/:level
 * @access Public
 */
export const getDSAByDifficulty = async (req, res) => {
  try {
    const { level } = req.params;

    // Validate input to only allow 'easy', 'medium', or 'hard'
    const allowedDifficulties = ['easy', 'medium', 'hard'];
    if (!allowedDifficulties.includes(level.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty level. Allowed values: easy, medium, hard",
      });
    }

    // Find all questions with the matching difficulty (case-insensitive)
    const questions = await DSAQuestion.find({
      difficulty: { $regex: new RegExp(`^${level}$`, "i") }
    });

    if (!questions.length) {
      return res.status(404).json({
        success: false,
        message: `No questions found for difficulty: ${level}`,
      });
    }

    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
