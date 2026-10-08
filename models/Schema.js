const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  purchased_stories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }]
});

const EpisodeSchema = new mongoose.Schema({
  ep_no: Number,
  title: String,
  audio_url: String,
  is_free: { type: Boolean, default: false }
});

const StorySchema = new mongoose.Schema({
  title: String,
  category: String,
  banner_url: String,
  original_price: Number,
  discount_price: Number,
  is_discount_active: { type: Boolean, default: false },
  total_episodes: Number,
  episodes: [EpisodeSchema]
});

const User = mongoose.model('User', UserSchema);
const Story = mongoose.model('Story', StorySchema);

module.exports = { User, Story };
