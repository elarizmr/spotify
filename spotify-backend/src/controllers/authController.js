const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Bu email artıq istifadə olunur." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "İstifadəçi uğurla yaradıldı!" });
  } catch (error) {
    res.status(500).json({ message: "Server xətası (Register)", error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "İstifadəçi tapılmadı." });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Yanlış şifrə." });

    // ✅ role token-ə əlavə edildi
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'gizli_kod',
      { expiresIn: '1d' }
    );

    // ✅ role response-a əlavə edildi
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server xətası (Login)", error });
  }
};

// ── LIKED SONGS ──
exports.getLikedSongs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('likedSongs');
    res.status(200).json({
      likedSongs: user.likedSongs,
      userName: user.name
    });
  } catch (error) {
    res.status(500).json({ message: "Xəta", error });
  }
};

exports.toggleLikeSong = async (req, res) => {
  try {
    const { songId } = req.params;
    const user = await User.findById(req.user.id);
    const isLiked = user.likedSongs.includes(songId);
    if (isLiked) {
      user.likedSongs = user.likedSongs.filter(id => id.toString() !== songId);
    } else {
      user.likedSongs.push(songId);
    }
    await user.save();
    res.status(200).json({ liked: !isLiked, likedSongs: user.likedSongs });
  } catch (error) {
    res.status(500).json({ message: "Xəta", error });
  }
};

// ── PLAYLISTS ──
exports.getPlaylists = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('playlists.songs');
    res.status(200).json({ playlists: user.playlists });
  } catch (error) {
    res.status(500).json({ message: "Xəta", error });
  }
};

exports.createPlaylist = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.id);
    user.playlists.push({ name, songs: [] });
    await user.save();
    res.status(201).json({ message: "Playlist yaradıldı!", playlists: user.playlists });
  } catch (error) {
    res.status(500).json({ message: "Xəta", error });
  }
};

exports.addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;
    const user = await User.findById(req.user.id);
    const playlist = user.playlists.id(playlistId);
    if (!playlist) return res.status(404).json({ message: "Playlist tapılmadı" });
    if (!playlist.songs.includes(songId)) playlist.songs.push(songId);
    await user.save();
    res.status(200).json({ message: "Mahnı əlavə edildi!", playlist });
  } catch (error) {
    res.status(500).json({ message: "Xəta", error });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const user = await User.findById(req.user.id);
    user.playlists = user.playlists.filter(p => p._id.toString() !== playlistId);
    await user.save();
    res.status(200).json({ message: "Playlist silindi!" });
  } catch (error) {
    res.status(500).json({ message: "Xəta", error });
  }
};