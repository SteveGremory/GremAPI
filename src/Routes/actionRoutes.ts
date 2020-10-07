import express from "express";
import {
  UploadPost,
  GetUser,
  GetUID,
  ChangePFP,
  FindByUsername,
  FollowUser,
  SearchUser,
  IsFollowing,
} from "../Controllers/Controllers";
import { checkAuth } from "../Middleware/Check-Auth";

const router = express.Router();

router.post("/post", UploadPost);
router.post("/getuser", GetUser);
router.post("/getuid", GetUID);
router.post("/changepfp", ChangePFP);
router.post("/findbyusername", FindByUsername);
router.post("/follow", FollowUser);
router.post("/search-user", SearchUser);
router.post("/is-following", IsFollowing);

export default router;
