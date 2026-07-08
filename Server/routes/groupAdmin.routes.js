// routes/groupAdmin.routes.js 
import { Router } from "express";
import {
	deleteGroup,
	deleteGroupImage,
	editGroup,
	kickMember,
	updateGroupImage,
} from "../controllers/groupAdmin.controller.js";
import { deleteMessage } from "../controllers/MessageController.js";
import { protect } from "../middleware/jwtAuth.js";
import {upload} from "../middleware/multer.js";

const router = Router();

router.post("/delete", protect, deleteGroup);
router.post("/edit", protect, upload.single("groupImage"), editGroup);
router.post("/image", protect, upload.single("groupImage"), updateGroupImage);
router.delete("/image", protect, deleteGroupImage);
router.post("/kick", protect, kickMember);

// conversation control
router.post("/message/delete", protect, deleteMessage);

export default router;
