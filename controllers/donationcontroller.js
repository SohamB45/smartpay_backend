// const donation = require("../models/donation");
const donation = require("../models/donation");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret:process.env.RAZORPAY_KEY_SECRET,
});

const createDonation = async (req, res) => {
  try {
    const { donorName, donorEmail, amount, message } = req.body;
    const newDonation = await Donation.create({
      donorName, donorEmail, amount, message,
    });
    res.json(newDonation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markDonationPaid = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id); // only ID here
    if (!donation) return res.status(404).json({ error: "Donation not found" });

    donation.status = "Paid";  // update status
    await donation.save();     // save updated doc

    res.json(donation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.json(donation).json({ message: "Donation not found" });
    }

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPayment = async (req, res) => {
  const donationId = req.params.id;
  const { amount } = req.body; // ✅ extract properly

  try {
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ error: "Donation not found" });

    const order = await razorpay.orders.create({
      amount: amount * 100, // ✅ convert to paise
      currency: "INR",
      receipt: `donation_${donationId}`,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, donationId } = req.body;

  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    const isValid = generatedSignature === razorpaySignature;

    if (isValid) {
      await Donation.findByIdAndUpdate(donationId, {
        status: "Paid",
        razorpayOrderId,
        razorpayPaymentId,
      });

      return res.json({ success: true, message: "Payment verified and status updated." });
    } else {
      await Donation.findByIdAndUpdate(donationId, { status: "Failed" });
      return res.json({ success: false, message: "Invalid signature. Payment marked as failed." });
    }
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: err.message });
  }
};

const markAsFailed = async (req, res) => {
  const donationId = req.params.id;

  try {
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ error: "Donation not found" });

    donation.status = "Failed";
    await donation.save();

    res.json({ success: true, message: "Donation marked as failed." });
  } catch (err) {
    console.error("Mark failed error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createDonation,
  getAllDonations,
  markDonationPaid,
  getDonationById,
  createPayment,
  verifyPayment,
  markAsFailed,
};
