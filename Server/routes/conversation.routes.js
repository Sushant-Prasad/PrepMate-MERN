import { Router } from "express";
import { protect } from "../middleware/jwtAuth.js";
import { getOrCreateDM, getMessages, sendMessage, getConversations } from "../controllers/conversation.controller.js";


const router = Router();



router.route("/dm").post(protect, getOrCreateDM);
router.get("/conversations", protect, getConversations);
router.get("/:conversationId/messages", protect, getMessages);
// router.post("/conv/message", protect, sendMessage);


export default router;