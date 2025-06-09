const express = require("express");
const router = express.Router();
const { createPayment } = require("../controllers/donationcontroller");

const {
  createDonation,
  getAllDonations,
  markDonationPaid,
  getDonationById,
  verifyPayment,
  markAsFailed
} = require("../controllers/donationcontroller");

router.post("/", createDonation);
router.get("/", getAllDonations);
router.put("/:id/mark-paid", markDonationPaid);
router.get("/:id", getDonationById);
router.post("/create-payment/:id", createPayment);
router.post("/verify-payment", verifyPayment);
router.put("/:id/fail", markAsFailed);

module.exports = router;
