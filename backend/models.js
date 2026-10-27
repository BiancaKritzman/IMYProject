const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  bio: String,
  quote: String,
  age: Number,
  country: String,
  hobbies: [String],
  postIds: [String],
  profileImage: String
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  caption: String,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const albumSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  postIds: [String]
}, { timestamps: true });

const friendshipSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  friendId: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Album = mongoose.model('Album', albumSchema);
const Friendship = mongoose.model('Friendship', friendshipSchema);

module.exports = { User, Post, Album, Friendship };
