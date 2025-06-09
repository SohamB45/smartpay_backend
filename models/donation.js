const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  donorEmail: { type: String },
  amount: { type: Number, required: true },
  message: { type: String },
  status: {
    type: String,
    enum: ["Unpaid", "Paid",'Failed'],
    default: "Unpaid",
  },
}, { timestamps: true });

module.exports = mongoose.model("donation", donationSchema);
