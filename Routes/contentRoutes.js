import express from "express";
import { UploadPost, GetUser, GetUID } from "../Controllers/Controllers.js";

const router = express.Router();

router.post("/post", UploadPost);
router.post("/getuser", GetUser);
router.post("/getuid", GetUID);

export default router;
