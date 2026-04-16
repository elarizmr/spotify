const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
  imageUrl: { type: String },
  bannerUrl: { type: String },
  monthlyListeners: { type: Number, default: 0 },
  worldRank: { type: Number, default: null },
  topCities: [
    {
      city: { type: String },
      country: { type: String },
      listeners: { type: Number, default: 0 },
    }
  ],
  galleryImages: [{ type: String }],
  followers: [{ type: String }],
}, {
  timestamps: true
});

const Artist = mongoose.model('Artist', artistSchema);
module.exports = Artist;