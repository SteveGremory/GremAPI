import {
  LoginUser,
  SignupUser,
  DeleteUser
} from "../Controllers/Controllers.js";
import {
  checkAuth
} from '../Middleware/Check-Auth.js'
import {
  createAccountLimiter
} from '../Middleware/Account-Limiter.js'

import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello");
});

router.post("/login", LoginUser, checkAuth);
router.post("/signup", SignupUser)
router.post("/:userId", DeleteUser)

export default router;