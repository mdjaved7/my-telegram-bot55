const router = require("express").Router();
const Story = require("../models/Story");
const Purchase = require("../models/Purchase");
const auth = require("../middleware/auth");

function activeDiscount(story) {
  const now = Date.now();

  return story.is_discount_active &&
    story.discount_price != null &&
    story.discount_price < story.original_price &&
    (!story.discount_starts_at ||
      new Date(story.discount_starts_at).getTime() <= now) &&
    (!story.discount_ends_at ||
      new Date(story.discount_ends_at).getTime() >= now);
}

function storyPrice(story) {
  return activeDiscount(story)
    ? story.discount_price
    : story.original_price;
}

// Public catalog: do not expose private audio URLs.
router.get("/", async (req, res, next) => {
  try {
    const filter = { published: true };
    if (req.query.category) filter.category = req.query.category;

    const stories = await Story.find(filter).sort({ createdAt: -1 }).lean();

    res.json(stories.map(s => ({
      _id: s._id,
      title: s.title,
      description: s.description,
      category: s.category,
      banner_url: s.banner_url,
      total_episodes: s.episodes.filter(e => e.published).length,
      original_price: s.original_price,
      current_price: storyPrice(s),
      is_discount_active: activeDiscount(s),
      sale_banner_message: activeDiscount(s)
        ? s.sale_banner_message : "",
      episodes: s.episodes.filter(e => e.published).map(e => ({
        ep_no: e.ep_no,
        title: e.title,
        is_free: e.is_free
      }))
    })));
  } catch (err) {
    next(err);
  }
});

// Story details, with audio access determined on the server.
router.get("/:id", auth, async (req, res, next) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
      published: true
    }).lean();

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    const owned = await Purchase.exists({
      user: req.user._id,
      story: story._id
    });

    const episodes = story.episodes
      .filter(e => e.published)
      .sort((a, b) => a.ep_no - b.ep_no)
      .map(e => {
        const unlocked = e.is_free || Boolean(owned);
        return {
          ep_no: e.ep_no,
          title: e.title,
          is_free: e.is_free,
          locked: !unlocked,
          audio_url: unlocked ? e.audio_url : null
        };
      });

    res.json({
      _id: story._id,
      title: story.title,
      description: story.description,
      category: story.category,
      banner_url: story.banner_url,
      total_episodes: episodes.length,
      original_price: story.original_price,
      current_price: storyPrice(story),
      is_discount_active: activeDiscount(story),
      sale_banner_message: activeDiscount(story)
        ? story.sale_banner_message : "",
      owned: Boolean(owned),
      episodes
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
