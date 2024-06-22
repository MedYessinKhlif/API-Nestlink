import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';

export const createPost = async (req, res, next) => {
  try {
    const post = await Post.create(req.body);
    return res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(errorHandler(404, 'Post not found!'));
  }

  if (req.user.id !== post.userRef) {
    return next(errorHandler(401, 'You can only delete your own posts!'));
  }

  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json('Post has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(errorHandler(404, 'Post not found!'));
  }
  if (req.user.id !== post.userRef) {
    return next(errorHandler(401, 'You can only update your own posts!'));
  }

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(errorHandler(404, 'Post not found!'));
    }
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

  
    let gender = req.query.gender;

    if (gender === undefined || gender === 'all') {
      gender = { $in: ['men', 'women'] };
    }

    const searchTerm = req.query.searchTerm || '';

    const sort = req.query.sort || 'createdAt';

    const order = req.query.order || 'desc';

    const posts = await Post.find({
      name: { $regex: searchTerm, $options: 'i' },
      gender,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};