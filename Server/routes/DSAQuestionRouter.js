import express from "express";
import {
  getAllDSA,
  getDSAById,
  createDSA,
  getDSAByCompanyTag,
  getDSAByTag,
  getDSAByDifficulty
} from "../controllers/DSAQuestionController.js";

const dsaQuestionRoutes = express.Router();

// CRUD routes
dsaQuestionRoutes.get("/",  getAllDSA);
dsaQuestionRoutes.get("/:id", getDSAById);
dsaQuestionRoutes.post("/",  createDSA);
dsaQuestionRoutes.get("/company/:CompanyTag", getDSAByCompanyTag);
dsaQuestionRoutes.get("/tag/:tag", getDSAByTag);
dsaQuestionRoutes.get("/difficulty/:level", getDSAByDifficulty);


export default dsaQuestionRoutes;
