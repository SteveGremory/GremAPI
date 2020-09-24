import {
  LogInIPFS,
  SignUpIPFS,
  DeleteUser,
} from "../Controllers/Controllers.js";
import { checkAuth } from "../Middleware/Check-Auth.js";
import { createAccountLimiter } from "../Middleware/Account-Limiter.js";

import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello");
});

router.post("/login", LogInIPFS, checkAuth);
router.post("/signup", SignUpIPFS);
router.post("/:userId", DeleteUser);

export default router;
