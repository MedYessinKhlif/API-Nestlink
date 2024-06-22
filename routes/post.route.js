import express from 'express';
import { createPost, deletePost, updatePost, getPost, getPosts } from '../controllers/post.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createPost);
router.delete('/delete/:id', verifyToken, deletePost);
router.post('/update/:id', verifyToken, updatePost);
router.get('/get/:id', getPost);
router.get('/get', getPosts);

export default router;
