import express from "express";
import staffController from "../controllers/staffController.js";

const router = express.Router();


router.post("/addMember", staffController.addMember);

router.get("/getAllMembers", staffController.getAllMembers);

router.get("/getSingleMember", staffController.getSingleMember);

router.patch("/updateMember", staffController.updateMember);

router.delete("/deleteMember", staffController.deleteMember);


export default router;