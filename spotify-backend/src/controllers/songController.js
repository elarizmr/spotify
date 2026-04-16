const Song = require('../models/Song');
const Artist = require('../models/Artist');

const addSong = async (req, res) => {
    try {
        const { title, artist, artistId, album, releaseDate, duration, section, lyrics } = req.body;
        const audioUrl = req.files['audio'] ? req.files['audio'][0].path : null;
        const coverImg = req.files['image'] ? req.files['image'][0].path : null;

        if (!audioUrl) {
            return res.status(400).json({ success: false, message: "Audio faylı mütləqdir!" });
        }

        const newSong = new Song({ title, artist, artistId, album, releaseDate, duration, audioUrl, coverImg, section: section || "Popular", lyrics: lyrics || '' });
        const savedSong = await newSong.save();
        res.status(201).json({ success: true, message: "Mahnı əlavə edildi!", song: savedSong });
    } catch (error) {
        res.status(500).json({ success: false, message: "Xəta baş verdi", error: error.message });
    }
};

const getAllSongs = async (req, res) => {
    try {
        const songs = await Song.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, songs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Xəta baş verdi", error: error.message });
    }
};

const getRandomSongs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const songs = await Song.aggregate([{ $sample: { size: limit } }]);
        res.status(200).json({ success: true, songs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Xəta baş verdi", error: error.message });
    }
};

const getSongById = async (req, res) => {
    try {
        const { id } = req.params;
        const song = await Song.findById(id);
        if (!song) return res.status(404).json({ success: false, message: "Mahnı tapılmadı!" });
        res.status(200).json({ success: true, song });
    } catch (error) {
        res.status(500).json({ success: false, message: "Xəta baş verdi", error: error.message });
    }
};

const incrementPlays = async (req, res) => {
    try {
        const { id } = req.params;
        const song = await Song.findByIdAndUpdate(
            id,
            { $inc: { plays: 1 } },
            { new: true }
        );
        if (!song) return res.status(404).json({ success: false, message: "Mahnı tapılmadı!" });
        res.status(200).json({ success: true, plays: song.plays });
    } catch (error) {
        res.status(500).json({ success: false, message: "Xəta baş verdi", error: error.message });
    }
};

const getSongsByArtist = async (req, res) => {
    try {
        const { artistName } = req.params;
        const songs = await Song.find({
            artist: { $regex: artistName, $options: 'i' }
        }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, songs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Xəta baş verdi", error: error.message });
    }
};

const searchSongs = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(200).json({ success: true, songs: [] });
        const songs = await Song.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { artist: { $regex: q, $options: 'i' } },
                { album: { $regex: q, $options: 'i' } },
            ]
        }).limit(20);
        res.status(200).json({ success: true, songs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Xəta baş verdi", error: error.message });
    }
};

const deleteSong = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSong = await Song.findByIdAndDelete(id);
        if (!deletedSong) {
            return res.status(404).json({ success: false, message: "Mahnı tapılmadı!" });
        }
        res.status(200).json({ success: true, message: "Mahnı uğurla silindi!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Silinmə zamanı xəta", error: error.message });
    }
};

const updateSong = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = { ...req.body };
        if (req.files) {
            if (req.files['audio']) updateData.audioUrl = req.files['audio'][0].path;
            if (req.files['image']) updateData.coverImg = req.files['image'][0].path;
        }
        const updatedSong = await Song.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ success: true, message: "Mahnı yeniləndi!", song: updatedSong });
    } catch (error) {
        res.status(500).json({ success: false, message: "Yenilənmə zamanı xəta", error: error.message });
    }
};

const migrateArtistIds = async (req, res) => {
    try {
        const songs = await Song.find({ artistId: { $exists: false } });
        let updated = 0;
        for (const song of songs) {
            const artist = await Artist.findOne({ name: { $regex: `^${song.artist}$`, $options: 'i' } });
            if (artist) {
                await Song.findByIdAndUpdate(song._id, { artistId: artist._id });
                updated++;
            }
        }
        res.status(200).json({ success: true, message: `${updated} mahnı yeniləndi` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { addSong, getAllSongs, getRandomSongs, getSongById, incrementPlays, deleteSong, updateSong, getSongsByArtist, searchSongs, migrateArtistIds };