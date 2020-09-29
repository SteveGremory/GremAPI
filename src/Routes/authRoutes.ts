import { LogInIPFS, SignUpIPFS } from "../Controllers/Controllers";
import { checkAuth } from "../Middleware/Check-Auth";
import { createAccountLimiter } from "../Middleware/Account-Limiter";

import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello");
});

router.post("/login", LogInIPFS, checkAuth);
router.post("/signup", SignUpIPFS);
//router.post("/:userId", DeleteUser);

export default router;
