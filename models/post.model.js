import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  { 
    name: { type: String, required: true, },
    description: { type: String, required: true, },
    gender: { type: String, required: true, },
    userRef: { type: String, required: true, },
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

export default Post;
