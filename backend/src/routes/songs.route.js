const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const getAudioFeatures = require("../utils/audio-analyser");
const uploadFile = require("../service/storage.service");
const songModel = require("../models/song.model");
const router = express.Router();
const tempUploadDir = path.join(__dirname, "../temp_uploads");

try {
  fs.mkdirSync(tempUploadDir, { recursive: true });
} catch (error) {
  if (error.code !== "EEXIST") {
    console.error("Error creating temp upload directory:", error);
    process.exit(1);
  }
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.post("/songs", upload.single("audio"), async (req, res) => {
  const tempFilePath = req.file.path;
  const { mood } = await getAudioFeatures(tempFilePath);

  const uploadedFile = await uploadFile(req.file);

  console.log(mood);
  const song = await songModel.create({
    title: req.body.title,
    artist: req.body.artist,
    audioURL: uploadedFile.url,
    mood: mood,
  });
  res.status(201).json({
    message: "Song created successfully",
  });
  fs.unlink(tempFilePath, (err) => {
    if (err) {
      console.error("Failed to delete temp file:", err);
    } else {
      console.log("Temporary file deleted successfully.");
    }
  });
});

router.get("/songs", async (req, res) => {
  const { mood } = req.query;
  console.log(mood);
  const songs = await songModel.find({
    mood: mood,
  });
  console.log(songs);
  res.status(200).json({ message: "Songs fetched successfully", song: songs });
});

module.exports = router;
