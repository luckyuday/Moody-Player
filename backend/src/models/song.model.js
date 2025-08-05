const mongoose = require("mongoose");
const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  audioURL: String,
  mood: String,
});

const songModel = mongoose.model("Song", songSchema);
module.exports = songModel;
