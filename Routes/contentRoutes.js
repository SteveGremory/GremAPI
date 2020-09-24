import express from "express";
import { UploadPost, GetPosts } from "../Controllers/Controllers.js";

const router = express.Router();

router.post("/post", UploadPost);
router.post("/getposts", GetPosts);

export default router;
