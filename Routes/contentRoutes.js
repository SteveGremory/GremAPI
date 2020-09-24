import express from "express";
import { UploadPost, GetUser } from "../Controllers/Controllers.js";

const router = express.Router();

router.post("/post", UploadPost);
router.post("/getuser", GetUser);

export default router;
