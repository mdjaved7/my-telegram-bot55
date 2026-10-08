const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { User, Story } = require('../models/Schema');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

// GET: Fetch all stories for Home Screen
router.get('/stories', async (req, res) => {
  const stories = await Story.find().select('-episodes'); // Omit episodes for list view
  res.json(stories);
});

// GET: Fetch Story Details
router.get('/story/:id', async (req, res) => {
  const story = await Story.findById(req.params.id);
  res.json(story);
});

// POST: Create Payment Order
router.post('/purchase/order', async (req, res) => {
  const { storyId } = req.body;
  const story = await Story.findById(storyId);
  
  const amount = story.is_discount_active ? story.discount_price : story.original_price;
  
  const options = {
    amount: amount * 100, // Razorpay works in paise
    currency: "INR",
    receipt: `receipt_${storyId}`
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Verify Payment & Unlock Story
router.post('/purchase/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, storyId } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
                             .update(sign.toString())
                             .digest("hex");

  if (razorpay_signature === expectedSign) {
    // Payment verified, unlock forever
    await User.findByIdAndUpdate(userId, {
      $addToSet: { purchased_stories: storyId }
    });
    res.json({ success: true, message: "Story Unlocked Forever" });
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
});

module.exports = router;
