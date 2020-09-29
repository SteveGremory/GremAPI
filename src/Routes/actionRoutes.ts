import express from "express";
import {
  UploadPost,
  GetUser,
  GetUID,
  ChangePFP,
  FindByUsername,
  FollowUser,
} from "../Controllers/Controllers";

const router = express.Router();

router.post("/post", UploadPost);
router.post("/getuser", GetUser);
router.post("/getuid", GetUID);
router.post("/changepfp", ChangePFP);
router.post("/findbyusername", FindByUsername);
router.post("/follow", FollowUser);

export default router;
