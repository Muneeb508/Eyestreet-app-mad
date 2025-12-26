const express = require('express');
const Issue = require('../models/Issue');

const router = express.Router();

// Get all issues with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const issues = await Issue.find(filter).sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get issues for a specific user
router.get('/my', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const issues = await Issue.find({ userId }).sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new issue
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      category,
      location,
      address,
      imageUrls,
    } = req.body;

    if (!userId || !title || !description || !category || !location?.lat || !location?.lng) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const issue = new Issue({
      userId,
      title,
      description,
      category,
      location,
      address,
      imageUrls: imageUrls || [],
    });

    await issue.save();
    res.status(201).json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update issue status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'inProgress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    res.json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upvote / remove upvote
router.post('/:id/upvote', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const hasUpvoted = issue.upvotes.some((id) => id.toString() === userId);

    if (hasUpvoted) {
      issue.upvotes = issue.upvotes.filter((id) => id.toString() !== userId);
    } else {
      issue.upvotes.push(userId);
    }

    await issue.save();
    res.json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark issue as done (resolved)
router.patch('/:id/done', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    // Check if user is the owner
    if (issue.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Only the owner can mark this issue as done' });
    }

    issue.status = 'resolved';
    await issue.save();
    res.json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete issue
router.delete('/:id', async (req, res) => {
  try {
    console.log('[ISSUES] Delete request received:', req.params.id);
    const { userId } = req.query;
    console.log('[ISSUES] UserId from query:', userId);
    
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      console.log('[ISSUES] Issue not found:', req.params.id);
      return res.status(404).json({ message: 'Issue not found' });
    }

    console.log('[ISSUES] Issue found, userId:', issue.userId.toString(), 'Request userId:', userId);
    
    // Check if user is the owner
    if (issue.userId.toString() !== userId) {
      console.log('[ISSUES] Unauthorized delete attempt');
      return res.status(403).json({ message: 'Only the owner can delete this issue' });
    }

    await Issue.findByIdAndDelete(req.params.id);
    console.log('[ISSUES] Issue deleted successfully');
    res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    console.error('[ISSUES] Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


