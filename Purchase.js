
const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: true
    },
    amount_paid: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    source: {
      type: String,
      enum: ["payment", "admin"],
      default: "payment"
    },
    razorpay_payment_id: { type: String, default: null },
    granted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

// One permanent entitlement per user per story.
purchaseSchema.index({ user: 1, story: 1 }, { unique: true });

module.exports = mongoose.model("Purchase", purchaseSchema);
