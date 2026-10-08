
const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema(
  {
    ep_no: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true },
    audio_url: { type: String, required: true },
    duration_seconds: { type: Number, default: 0 },
    is_free: { type: Boolean, default: false },
    published: { type: Boolean, default: true }
  },
  { _id: true }
);

const storySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, required: true, index: true },
    banner_url: { type: String, required: true },
    original_price: { type: Number, required: true, min: 1 },
    discount_price: { type: Number, min: 1, default: null },
    is_discount_active: { type: Boolean, default: false },
    sale_banner_message: { type: String, default: "" },
    discount_starts_at: { type: Date, default: null },
    discount_ends_at: { type: Date, default: null },
    published: { type: Boolean, default: false },
    episodes: { type: [episodeSchema], default: [] }
  },
  { timestamps: true }
);

storySchema.virtual("total_episodes").get(function () {
  return this.episodes.filter(ep => ep.published).length;
});

storySchema.set("toJSON", { virtuals: true });
storySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Story", storySchema);
