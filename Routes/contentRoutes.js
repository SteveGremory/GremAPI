import express from "express";
import {
  UploadPost,
  GetUser,
  GetUID,
  ChangePFP,
  FindByUsername,
} from "../Controllers/Controllers.js";

const router = express.Router();

router.post("/post", UploadPost);
router.post("/getuser", GetUser);
router.post("/getuid", GetUID);
router.post("/changepfp", ChangePFP);
router.post("/findbyusername", FindByUsername);

export default router;
