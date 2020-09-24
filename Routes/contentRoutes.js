import express from "express";
import {
  UploadPost,
  GetUser,
  GetUID,
  ChangePFP,
} from "../Controllers/Controllers.js";

const router = express.Router();

router.post("/post", UploadPost);
router.post("/getuser", GetUser);
router.post("/getuid", GetUID);
router.post("/changepfp", ChangePFP);

export default router;
