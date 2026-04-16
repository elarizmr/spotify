const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
    album: { type: String },
    genre: { type: String },
    duration: { type: Number },
    releaseDate: { type: Date },
    section: {
        type: String,
        enum: ["Popular", "New Releases", "Trending", "Featured"],
        default: "Popular"
    },
    audioUrl: { type: String, required: false },
    coverImg: { type: String, default: "https://via.placeholder.com/150" },
    plays: { type: Number, default: 0 },
    lyrics: { type: String, default: '' }  // ← əlavə edildi
}, {
    timestamps: true
});

const Song = mongoose.model('Song', songSchema);

module.exports = Song;