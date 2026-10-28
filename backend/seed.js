
const mongoose = require('mongoose');
const { User, Post, Album, Friendship } = require('./models');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/photo_posting_db';

const seedData = async () => {
  await mongoose.connect(mongoUri);

  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Album.deleteMany({}),
    Friendship.deleteMany({})
  ]);

  const users = await User.insertMany([
    {
      name: 'Ava Smith',
      email: 'ava@example.com',
      password: 'password123',
      isAdmin: true,
      bio: 'Nature photographer',
      country: 'South Africa',
      hobbies: ['Photography', 'Hiking'],
      profileImage: 'https://example.com/ava.jpg'
    },
    {
      name: 'Liam Brown',
      email: 'liam@example.com',
      password: 'password123',
      bio: 'Travel and landscape lover',
      country: 'Kenya',
      hobbies: ['Travel', 'Camping'],
      profileImage: 'https://example.com/liam.jpg'
    }
  ]);

  const posts = await Post.insertMany([
    {
      userId: users[0]._id.toString(),
      title: 'Sunrise Over Valley',
      imageUrl: 'https://example.com/post1.jpg',
      caption: 'Early morning light in the mountains.',
      createdAt: new Date('2026-10-01T08:00:00Z')
    },
    {
      userId: users[1]._id.toString(),
      title: 'Forest Path',
      imageUrl: 'https://example.com/post2.jpg',
      caption: 'A calm walk through the woods.',
      createdAt: new Date('2026-10-01T09:30:00Z')
    }
  ]);

  await Album.insertMany([
    {
      userId: users[0]._id.toString(),
      name: 'Travel Highlights',
      description: 'My best landscape shots',
      postIds: posts.map((post) => post._id.toString())
    }
  ]);

  await Friendship.insertMany([
    {
      userId: users[0]._id.toString(),
      friendId: users[1]._id.toString()
    }
  ]);

  console.log('Database seeded successfully');
  console.log('Users:', users.length);
  console.log('Posts:', posts.length);
  console.log('Albums:', 1);
  console.log('Friendships:', 1);

  await mongoose.disconnect();
};

seedData().catch((error) => {
  console.error('Seeding failed:', error.message);
  process.exit(1);
});
