import { Router } from "express";
import { protect } from "../middleware/jwtAuth.js";
import { sendMessage, deleteMessage, } from "../controllers/MessageController.js";
// import upload from "../middleware/multer.js";
import { upload } from "../middleware/multer.js";


const router = Router();


router.post("/message/send", protect, upload.single("media"), sendMessage);
router.delete("/:messageId/delete", protect, deleteMessage);


export default router;