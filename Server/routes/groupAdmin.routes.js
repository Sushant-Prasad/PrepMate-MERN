// routes/groupAdmin.routes.js 
import { Router } from "express";
import { deleteGroup, editGroup, kickMember } from "../controllers/groupAdmin.controller.js";
import { deleteMessage } from "../controllers/MessageController.js";
import { protect } from "../middleware/jwtAuth.js";
import {upload} from "../middleware/multer.js";

const router = Router();

router.post("/delete", protect, deleteGroup);
router.post("/edit", protect, upload.single("groupImage"), editGroup);
router.post("/kick", protect, kickMember);

// conversation control
router.post("/message/delete", protect, deleteMessage);

export default router;
