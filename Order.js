
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
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
    razorpay_order_id: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created"
    },
    razorpay_payment_id: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
