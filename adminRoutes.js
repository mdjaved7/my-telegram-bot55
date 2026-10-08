
const router = require("express").Router();
const Story = require("../models/Story");
const User = require("../models/User");
const Purchase = require("../models/Purchase");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

router.use(auth, adminAuth);

router.post("/stories", async (req, res, next) => {
  try {
    const story = await Story.create(req.body);
    res.status(201).json(story);
  } catch (err) {
    next(err);
  }
});

router.patch("/stories/:id", async (req, res, next) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    res.json(story);
  } catch (err) {
    next(err);
  }
});

router.post("/stories/:id/episodes", async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    const ep = req.body;
    if (!Number.isInteger(ep.ep_no) || ep.ep_no < 1 ||
        !ep.title || !ep.audio_url) {
      return res.status(400).json({
        message: "Valid episode number, title and audio URL required"
      });
    }

    if (story.episodes.some(e => e.ep_no === ep.ep_no)) {
      return res.status(409).json({
        message: "Episode number already exists"
      });
    }

    story.episodes.push(ep);
    await story.save();
    res.status(201).json(story);
  } catch (err) {
    next(err);
  }
});

router.patch("/stories/:id/discount", async (req, res, next) => {
  try {
    const { is_discount_active, discount_price,
      sale_banner_message, discount_starts_at,
      discount_ends_at } = req.body;

    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (is_discount_active) {
      if (!Number.isFinite(discount_price) ||
          discount_price <= 0 ||
          discount_price >= story.original_price) {
        return res.status(400).json({
          message: "Discount must be positive and below original price"
        });
      }
      if (discount_starts_at && discount_ends_at &&
          new Date(discount_starts_at) >= new Date(discount_ends_at)) {
        return res.status(400).json({
          message: "Discount end must be after start"
        });
      }
    }

    story.is_discount_active = Boolean(is_discount_active);
    story.discount_price = discount_price ?? story.discount_price;
    story.sale_banner_message = sale_banner_message ?? "";
    story.discount_starts_at = discount_starts_at || null;
    story.discount_ends_at = discount_ends_at || null;

    await story.save();
    res.json(story);
  } catch (err) {
    next(err);
  }
});

// Manually grant unlimited access.
router.post("/users/:userId/grant/:storyId", async (req, res, next) => {
  try {
    const [user, story] = await Promise.all([
      User.findById(req.params.userId),
      Story.findById(req.params.storyId)
    ]);

    if (!user || !story) {
      return res.status(404).json({
        message: "User or story not found"
      });
    }

    const purchase = await Purchase.findOneAndUpdate(
      { user: user._id, story: story._id },
      {
        $setOnInsert: {
          user: user._id,
          story: story._id,
          amount_paid: 0,
          currency: "INR",
          source: "admin",
          granted_by: req.user._id
        }
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, purchase });
  } catch (err) {
    next(err);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find()
      .select("name phone role createdAt")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.get("/purchases", async (req, res, next) => {
  try {
    const purchases = await Purchase.find()
      .populate("user", "name phone")
      .populate("story", "title")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json(purchases);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
