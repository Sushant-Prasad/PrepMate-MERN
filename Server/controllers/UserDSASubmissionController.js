import axios from "axios";
import UserDSASubmission from "../models/UserDSASubmission.js";
import DSAQuestion from "../models/DSAQuestion.js";
import { languageMapping } from "../utils/languageMapper.js";

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_HEADERS = {
  "Content-Type": "application/json",
  "X-RapidAPI-Host": process.env.JUDGE0_API_HOST,
  "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
};

// Submit DSA solution
export const submitDSASolution = async (req, res) => {
  try {
    const { userId, questionId, code, language, mode } = req.body;

    // 1. Ensure question exists
    const question = await DSAQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const testCases = question.testCases; // should contain [{ input, output }]
    if (!testCases || testCases.length === 0) {
      return res
        .status(400)
        .json({ message: "No test cases found for this question" });
    }
    // Map frontend language → Judge0 ID
    const languageId = languageMapping[language];
    if (!languageId) {
      return res
        .status(400)
        .json({ message: `Unsupported language: ${language}` });
    }

    let passedCount = 0;
    let failedCount = 0;
    const testCaseResults = [];

    // 2. Run code for each test case
    for (let tc of testCases) {
      const submission = await axios.post(
        `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
        {
          source_code: code,
          language_id:languageId, 
          stdin: tc.input,
          expected_output: tc.output,
        },
        { headers: JUDGE0_HEADERS }
      );

      const token = submission.data.token;

      // Poll Judge0 for result
      let result;
      while (true) {
        const response = await axios.get(
          `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
          { headers: JUDGE0_HEADERS }
        );

        result = response.data;
        if (result.status && result.status.id >= 3) break; // Done
        await new Promise((r) => setTimeout(r, 1500));
      }

      // Compare result
      const actualOutput = (result.stdout || "").trim();
      const expectedOutput = (tc.output || "").trim();
      const passed = actualOutput === expectedOutput;

      if (passed) passedCount++;
      else failedCount++;

      testCaseResults.push({
        input: tc.input,
        expectedOutput,
        actualOutput,
        passed,
        executionTime: result.time ? parseFloat(result.time) * 1000 : null,
      });
    }

    // 3. Decide final status
    let status = "pending";
    if (failedCount > 0) status = "wrong-answer";
    else if (passedCount === testCases.length) status = "accepted";

    // If Judge0 reported errors
    if (testCaseResults.some((tc) => tc.actualOutput === "")) {
      status = "runtime-error";
    }

    // 4. Only save correct submissions
    if (status === "accepted") {
      const submission = await UserDSASubmission.create({
        userId,
        questionId,
        code,
        language,
        status,
        mode,
        testCaseResults,
        executionSummary: {
          totalTestCases: testCases.length,
          passedCount,
          failedCount,
          executionTime: testCaseResults.reduce(
            (sum, tc) => sum + (tc.executionTime || 0),
            0
          ),
        },
        errorLogs: {
          compilationError: null,
          runtimeError: null,
        },
      });

      return res.status(201).json({
        message: "Solution accepted and stored in DB",
        submission,
      });
    }

    return res.status(200).json({
      message: "Solution not accepted, not stored in DB",
      status,
      testCaseResults,
    });
  } catch (error) {
    console.error(
      "Error in submitDSASolution:",
      error?.response?.data || error.message
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get submissions by user
export const getUserSubmissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const submissions = await UserDSASubmission.find({ userId }).populate(
      "questionId"
    );
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
