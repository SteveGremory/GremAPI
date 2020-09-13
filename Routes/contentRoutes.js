import express from 'express'
import Post from '../Models/Post.js'
import {uploadPost} from '../Controllers/Controllers.js'

const router = express.Router();

router.post("/post", uploadPost)

export default router;