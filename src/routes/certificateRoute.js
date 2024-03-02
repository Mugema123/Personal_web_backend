import express from "express";
import certificateController from "../controllers/certificateController.js";
import regNumberController from "../controllers/regNumberController.js";

const router = express.Router();


router.post("/saveCertificate", certificateController.saveCertificate);

router.get("/getCertificate", certificateController.getCertificate);

router.post("/emailCertificate", certificateController.emailCertificate);

router.post("/saveRegNumber", regNumberController.addRegNumber);

router.get("/generateRegNumber", regNumberController.generateRegNumber);

export default router;