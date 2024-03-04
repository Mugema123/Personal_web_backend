import express from "express";
import contactController from "../controllers/contactController.js";
import authentication from "../middlewares/authentication.js";

const router = express.Router();

router.post("/send", contactController.sendMessage);

router.get("/", authentication.isAdmin, contactController.getAllMessages);

router.get(
  "/getSingleMessage",
  authentication.isAdmin,
  contactController.getSingleMessage
);

router.patch("/reply", authentication.isAdmin, contactController.replyMessage);

router.delete(
  "/delete",
  authentication.isAdmin,
  contactController.deleteMessage
);

export default router;
