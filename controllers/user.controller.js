import bcryptjs from 'bcryptjs';
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';

import { User } from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

import Listing from '../models/listing.model.js';
import Post from '../models/post.model.js';

const validate = (data) => {
  return Joi.object({
    fullName: Joi.string().regex(/^[a-zA-Z\s]+$/).min(8).max(25).label("fullName"),
    password: passwordComplexity().label('Password'),
    avatar: Joi.string(),
  }).validate(data);
};

export const test = (req, res) => {
  res.json({
    message: 'Api route is working!',
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only update your own account.'));
  try {
    const { error } = validate(req.body);
    if (error) {
      return next(errorHandler(400, error.details[0].message));
    }
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          fullName: req.body.fullName,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only delete your own account.'));
  try {
    // Delete user's listings
    await Listing.deleteMany({ userRef: req.params.id });
    
    // Delete user's posts
    await Post.deleteMany({ userRef: req.params.id });

    // Delete the user account
    await User.findByIdAndDelete(req.params.id);
    
    res.clearCookie('access_token');
    res.status(200).json('User has been deleted along with associated listings and posts.');
  } catch (error) {
    next(error);
  }
};


export const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own listings.'));
  }
};


export const getUserPosts = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const posts = await Post.find({ userRef: req.params.id });
      res.status(200).json(posts);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own posts.'));
  }
};


export const getUser = async (req, res, next) => {
  try { 
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, 'User not found.'));
    const { password: pass, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
