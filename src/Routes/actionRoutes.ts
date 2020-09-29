import express from "express";
import {
  UploadPost,
  GetUser,
  GetUID,
  ChangePFP,
  FindByUsername,
  FollowUser,
} from "../Controllers/Controllers";
import { checkAuth } from "../Middleware/Check-Auth";

const router = express.Router();

router.post("/post", UploadPost, checkAuth);
router.post("/getuser", GetUser, checkAuth);
router.post("/getuid", GetUID, checkAuth);
router.post("/changepfp", ChangePFP, checkAuth);
router.post("/findbyusername", FindByUsername, checkAuth);
router.post("/follow", FollowUser, checkAuth);

export default router;
