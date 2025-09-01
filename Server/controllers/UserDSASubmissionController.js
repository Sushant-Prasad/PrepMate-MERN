import axios from "axios";
import UserDSASubmission from "../models/UserDSASubmission.js";
import DSAQuestion from "../models/DSAQuestion.js";
import { languageMapping } from "../utils/languageMapper.js";
import UserProfile from "../models/UserProfile.js";

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_HEADERS = {
  "Content-Type": "application/json",
  "X-RapidAPI-Host": process.env.JUDGE0_API_HOST,
  "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
};

/* ---------------------------------------------
   🔎 Always log recent activity (atomic, race-safe)
   - Inserts at front
   - Keeps only latest 10
   - No-ops if profile not found
----------------------------------------------*/
const logRecentActivity = async (userId, questionId) => {
  await UserProfile.updateOne(
    { userId },
    {
      $push: {
        recentActivity: {
          $each: [{ type: "dsa", questionId, solvedAt: new Date() }],
          $position: 0,
          $slice: 10,
        },
      },
    }
  );
};

/* ---------------------------------------------
   🔥 Update DSA streak ONLY (no activity push)
   - One increment per day
   - Continues if solved yesterday, else resets to 1
----------------------------------------------*/
const updateDSAStreak = async (userId, questionId) => {
  const profile = await UserProfile.findOne({ userId });
  if (!profile) return null;

  const streak = profile.dsaStreak || {
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
    // consecutive day
    streak.currentStreak += 1;
  } else {
    // reset to 1
    streak.currentStreak = 1;
  }

  streak.bestStreak = Math.max(streak.bestStreak, streak.currentStreak);
  streak.lastSolvedDate = new Date();

  profile.dsaStreak = streak;
  await profile.save();

  return profile.dsaStreak;
};

// Submit DSA solution
export const submitDSASolution = async (req, res) => {
  try {
    const { questionId, code, language, mode } = req.body;
    const userId = req.user.id;
    // 1) Ensure question exists
    const question = await DSAQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const testCases = question.testCases; // [{ input, output }]
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

    // 2) Run code for each test case
    for (const tc of testCases) {
      const submission = await axios.post(
        `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
        {
          source_code: code,
          language_id: languageId,
          stdin: tc.input,
          expected_output: tc.output,
        },
        { headers: JUDGE0_HEADERS }
      );

      const token = submission.data.token;

      // Poll Judge0
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

    // 3) Final status

    let status = "pending";

    if (testCaseResults.some((tc) => tc.status === "Compilation error")) {
      status = "compilation-error";
    } else if (
      testCaseResults.some((tc) => tc.status === "Time Limit Exceeded")
    ) {
      status = "time-limit-exceeded";
    } else if (testCaseResults.some((tc) => tc.actualOutput === "")) {
      status = "runtime-error";
    } else if (failedCount > 0) {
      status = "wrong-answer";
    } else if (passedCount === testCases.length) {
      status = "accepted";
    }

    // 4) Persist accepted submissions
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
        errorLogs: { compilationError: null, runtimeError: null },
      });

      // 🌟 ALWAYS log recent activity (practice or streak)
      await logRecentActivity(userId, questionId);

      // 🔥 Update streak ONLY if mode === 'streak'
      let streakUpdate = null;
      if (mode === "streak") {
        streakUpdate = await updateDSAStreak(userId, questionId);
        if (!streakUpdate) {
          console.warn(
            `No profile found for user ${userId}, streak not updated`
          );
        }
      }

      return res.status(201).json({
        message: "Solution accepted and stored in DB",
        submission,
        streak: streakUpdate, // may be null if not streak mode
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
// Run DSA solution without saving to DB
export const runDSA = async (req, res) => {
  try {
    const { code, language, stdin } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "Code and language are required" });
    }

    // Map frontend language → Judge0 ID
    const languageId = languageMapping[language];
    if (!languageId) {
      return res
        .status(400)
        .json({ message: `Unsupported language: ${language}` });
    }

    // 1) Create submission on Judge0
    const submission = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
      {
        source_code: code,
        language_id: languageId,
        stdin: stdin || "",
      },
      { headers: JUDGE0_HEADERS }
    );

    const token = submission.data.token;

    // 2) Poll Judge0 until completion
    let result;
    while (true) {
      const response = await axios.get(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
        { headers: JUDGE0_HEADERS }
      );
      result = response.data;
      if (result.status && result.status.id >= 3) break;
      await new Promise((r) => setTimeout(r, 1500));
    }

    // 3) Respond with execution details
    res.json({
      success: true,
      status: result.status?.description,
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output,
      time: result.time,
      memory: result.memory,
    });
  } catch (error) {
    console.error("Error in runDSA:", error?.response?.data || error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
