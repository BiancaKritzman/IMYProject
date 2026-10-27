const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const { User, Post, Album, Friendship } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/social-data', async (req, res) => {
  try {
    const [users, posts, albums, friendships] = await Promise.all([
      User.find().lean(),
      Post.find().lean(),
      Album.find().lean(),
      Friendship.find().lean()
    ]);

    const userMap = new Map(users.map((user) => [String(user._id), user]));

    const mappedAccounts = posts.map((post) => {
      const owner = userMap.get(String(post.userId)) || null;
      const authorName = owner?.name || owner?.email?.split('@')[0] || 'Unknown user';

      return {
        id: String(post._id || post.id),
        userId: String(post.userId || owner?._id || post._id || post.id),
        name: authorName,
        desc: post.caption || post.title || 'No description'
      };
    });

    const midpoint = Math.ceil(mappedAccounts.length / 2);

    res.status(200).json({
      currentUserId: users[0]?._id?.toString() || null,
      users,
      posts,
      albums,
      friendships,
      localAccounts: mappedAccounts.slice(0, midpoint),
      globalAccounts: mappedAccounts.slice(midpoint)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch social data', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    return res.status(200).json({
      message: 'Login successful',
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});
app.post('/api/signup', async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      bio: '',
      country: '',
      hobbies: [],
      profileImage: ''
    });

    return res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Signup failed', error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Post.deleteMany({ userId: req.params.id });
    await Album.deleteMany({ userId: req.params.id });
    await Friendship.deleteMany({ $or: [{ userId: req.params.id }, { friendId: req.params.id }] });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { userId, title, imageUrl, caption } = req.body;

    const currentUser = await User.findById(userId);

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!currentUser?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const post = await Post.create({ userId, title, imageUrl, caption });
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch post', error: error.message });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json({ message: 'Post updated successfully', post });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update post', error: error.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await Album.updateMany({}, { $pull: { postIds: req.params.id } });
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post', error: error.message });
  }
});

app.get('/api/albums', async (req, res) => {
  try {
    const albums = await Album.find();
    res.status(200).json(albums);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch albums', error: error.message });
  }
});

app.get('/api/albums/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: 'Album not found' });
    res.status(200).json(album);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch album', error: error.message });
  }
});

app.post('/api/albums', async (req, res) => {
  try {
    const album = await Album.create(req.body);
    res.status(201).json({ message: 'Album created successfully', album });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create album', error: error.message });
  }
});

app.put('/api/albums/:id', async (req, res) => {
  try {
    const album = await Album.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!album) return res.status(404).json({ message: 'Album not found' });
    res.status(200).json({ message: 'Album updated successfully', album });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update album', error: error.message });
  }
});

app.delete('/api/albums/:id', async (req, res) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id);
    if (!album) return res.status(404).json({ message: 'Album not found' });
    res.status(200).json({ message: 'Album deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete album', error: error.message });
  }
});

app.get('/api/friendships', async (req, res) => {
  try {
    const friendships = await Friendship.find();
    res.status(200).json(friendships);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch friendships', error: error.message });
  }
});

app.get('/api/friendships/:id', async (req, res) => {
  try {
    const friendship = await Friendship.findById(req.params.id);
    if (!friendship) return res.status(404).json({ message: 'Friendship not found' });
    res.status(200).json(friendship);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch friendship', error: error.message });
  }
});

app.post('/api/friendships', async (req, res) => {
  try {
    const friendship = await Friendship.create(req.body);
    res.status(201).json({ message: 'Friend added successfully', friendship });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add friend', error: error.message });
  }
});

app.put('/api/friendships/:id', async (req, res) => {
  try {
    const friendship = await Friendship.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!friendship) return res.status(404).json({ message: 'Friendship not found' });
    res.status(200).json({ message: 'Friendship updated successfully', friendship });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update friendship', error: error.message });
  }
});

app.delete('/api/friendships/:id', async (req, res) => {
  try {
    const friendship = await Friendship.findByIdAndDelete(req.params.id);
    if (!friendship) return res.status(404).json({ message: 'Friendship not found' });
    res.status(200).json({ message: 'Friendship deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete friendship', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });