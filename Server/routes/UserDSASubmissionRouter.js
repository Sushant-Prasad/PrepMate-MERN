import express from "express";
import {
  submitDSASolution,
  getUserSubmissions,
} from "../controllers/UserDSASubmissionController.js";

const UserDSASubmissionRouter = express.Router();

UserDSASubmissionRouter.post("/", submitDSASolution); // submit solution
UserDSASubmissionRouter.get("/:userId", getUserSubmissions); // get all submissions of user

export default UserDSASubmissionRouter;
