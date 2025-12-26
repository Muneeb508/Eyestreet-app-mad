const express = require('express');
const CommunityPost = require('../models/CommunityPost');

const router = express.Router();

// Get posts, optional city filter
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    const filter = {};
    if (city && city !== 'All') filter.city = city;

    const posts = await CommunityPost.find(filter).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/', async (req, res) => {
  try {
    const { userId, userName, content, city } = req.body;
    if (!userId || !userName || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const post = new CommunityPost({
      userId,
      userName,
      content,
      city,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like / unlike
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const hasLiked = post.likes.some((id) => id.toString() === userId);

    if (hasLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post
router.patch('/:id', async (req, res) => {
  try {
    const { userId, content, city } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    if (!content) return res.status(400).json({ message: 'content is required' });

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if user is the owner
    console.log(`[UPDATE] Comparing post.userId: ${post.userId.toString()} with userId: ${userId?.toString()}`);
    if (post.userId.toString() !== userId?.toString()) {
      return res.status(403).json({ message: 'Only the owner can edit this post' });
    }

    post.content = content;
    if (city) post.city = city;
    await post.save();

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if user is the owner
    console.log(`[DELETE] Comparing post.userId: ${post.userId.toString()} with userId: ${userId?.toString()}`);
    if (post.userId.toString() !== userId?.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete this post' });
    }

    await CommunityPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


