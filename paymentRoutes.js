
const router = require("express").Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const auth = require("../middleware/auth");
const Story = require("../models/Story");
const Order = require("../models/Order");
const Purchase = require("../models/Purchase");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

function getPrice(story) {
  const now = Date.now();
  const active = story.is_discount_active &&
    story.discount_price != null &&
    story.discount_price < story.original_price &&
    (!story.discount_starts_at ||
      new Date(story.discount_starts_at).getTime() <= now) &&
    (!story.discount_ends_at ||
      new Date(story.discount_ends_at).getTime() >= now);

  return active ? story.discount_price : story.original_price;
}

// Create a server-priced order.
router.post("/create-order", auth, async (req, res, next) => {
  try {
    const { storyId } = req.body;

    if (!storyId) {
      return res.status(400).json({ message: "storyId required" });
    }

    const story = await Story.findOne({
      _id: storyId,
      published: true
    });

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (await Purchase.exists({
      user: req.user._id,
      story: story._id
    })) {
      return res.status(409).json({
        message: "Story already owned"
      });
    }

    const amount = getPrice(story);
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: crypto.randomUUID(),
      notes: {
        userId: req.user._id.toString(),
        storyId: story._id.toString()
      }
    });

    await Order.create({
      user: req.user._id,
      story: story._id,
      razorpay_order_id: razorpayOrder.id,
      amount,
      currency: "INR"
    });

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      storyTitle: story.title
    });
  } catch (err) {
    next(err);
  }
});

// Verify checkout and grant permanent access.
router.post("/verify", auth, async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature) {
      return res.status(400).json({
        message: "Missing payment verification fields"
      });
    }

    const order = await Order.findOne({
      razorpay_order_id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "paid") {
      return res.json({ success: true, alreadyOwned: true });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const supplied = Buffer.from(razorpay_signature, "hex");
    const calculated = Buffer.from(expected, "hex");

    if (supplied.length !== calculated.length ||
        !crypto.timingSafeEqual(supplied, calculated)) {
      return res.status(400).json({
        message: "Invalid payment signature"
      });
    }

    // Confirm payment status and amount directly with Razorpay.
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.order_id !== order.razorpay_order_id ||
        payment.status !== "captured" ||
        payment.amount !== Math.round(order.amount * 100) ||
        payment.currency !== order.currency) {
      return res.status(400).json({
        message: "Payment is not captured or amount does not match"
      });
    }

    await Purchase.updateOne(
      { user: order.user, story: order.story },
      {
        $setOnInsert: {
          user: order.user,
          story: order.story,
          amount_paid: order.amount,
          currency: order.currency,
          source: "payment",
          razorpay_payment_id
        }
      },
      { upsert: true }
    );

    order.status = "paid";
    order.razorpay_payment_id = razorpay_payment_id;
    await order.save();

    res.json({
      success: true,
      message: "Story unlocked permanently"
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
