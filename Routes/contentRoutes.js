import express from "express";
import { UploadPost } from "../Controllers/Controllers.js";

const router = express.Router();

router.post("/post", UploadPost);

export default router;
