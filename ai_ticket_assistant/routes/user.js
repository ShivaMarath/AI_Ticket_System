import express, { Router } from "express"
import { getUser, logout, signin, signup, updateUser } from "../controllers/user.js"
import { authenticate } from "../middlewares/auth.js"
const router = express.Router()



router.post("/update-user", authenticate, updateUser)
router.get("/get-user", authenticate, getUser)
router.post("/signup", signup)
router.post("/signin", signin)
router.post("/logout", logout)

export default router