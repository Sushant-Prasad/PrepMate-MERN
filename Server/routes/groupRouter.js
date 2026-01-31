// routes/group.routes.js
import { Router } from "express";
import {
  createGroup,
  joinGroup,
  leaveGroup,
  sendGroupMessage,
  getMyGroups,
  searchGroups
} from "../controllers/Group.js";
import { protect } from "../middleware/jwtAuth.js";
import {upload} from "../middleware/multer.js"; // for media upload
const router = Router();

// Create a group
router.post("/create", protect, upload.single("groupImage"), 
createGroup);
router.post("/join", protect, joinGroup);
router.post("/leave", protect, leaveGroup);
// router.post("/group/message", protect, upload.single("media"), sendGroupMessage);
// Fetch groups user belongs to
router.get("/groups", protect, getMyGroups);

// Search groups by name
router.get("/group/search", protect, searchGroups);

export default router;
