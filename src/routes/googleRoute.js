import express from "express"
import googleController from "../controllers/googleController.js"

const router = express.Router()

router.post("/googleAuth", googleController.googleAuth)


export default router