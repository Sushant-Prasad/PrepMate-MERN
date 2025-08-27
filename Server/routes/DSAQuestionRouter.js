import express from "express";
import {
  getAllDSA,
  getDSAById,
  createDSA,
  getDSAByCompanyTag,
  getDSAByTag,
  getDSAByDifficulty,updateDSA ,deleteDSA
} from "../controllers/DSAQuestionController.js";

const dsaQuestionRoutes = express.Router();

// CRUD routes
dsaQuestionRoutes.get("/",  getAllDSA);
dsaQuestionRoutes.get("/:id", getDSAById);
dsaQuestionRoutes.post("/",  createDSA);
dsaQuestionRoutes.get("/company/:CompanyTag", getDSAByCompanyTag);
dsaQuestionRoutes.get("/tag/:tag", getDSAByTag);
dsaQuestionRoutes.get("/difficulty/:level", getDSAByDifficulty);
dsaQuestionRoutes.put("/:id", updateDSA);
dsaQuestionRoutes.delete("/:id", deleteDSA);


export default dsaQuestionRoutes;
