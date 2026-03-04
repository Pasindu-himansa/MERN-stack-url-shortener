const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const Url = require("../models/url");

// Create short url
router.post("/shorten", async (req, res) => {
  try {
    const { originalUrl } = req.body;
    if (!originalUrl)
      return res.status(400).json({ message: "originalUrl is required" });

    const shortCode = nanoid(7);

    const doc = await Url.create({ originalUrl, shortCode });
    return res.json({
      originalUrl: doc.originalUrl,
      shortCode: doc.shortCode,
      shortUrl: `${process.env.BASE_URL}/${doc.shortCode}`,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Redirect
router.get("/:code", async (req, res) => {
  try {
    const code = req.params.code;
    const urlDoc = await Url.findOne({ shortCode: code });
    if (!urlDoc) return res.status(404).send("Not found");

    urlDoc.clicks += 1;
    await urlDoc.save();

    return res.redirect(urlDoc.originalUrl);
  } catch (err) {
    return res.status(500).send("Server error");
  }
});

module.exports = router;
