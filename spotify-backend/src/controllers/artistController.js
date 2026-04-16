const Artist = require('../models/Artist');

const addArtist = async (req, res) => {
  try {
    const { name, bio, monthlyListeners, worldRank, topCities } = req.body;
    const imageUrl = req.files['image'] ? req.files['image'][0].path : null;
    const bannerUrl = req.files['banner'] ? req.files['banner'][0].path : null;
    const galleryImages = req.files['gallery'] ? req.files['gallery'].map(f => f.path) : [];

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: "Artist şəkli mütləqdir!" });
    }

    let parsedCities = [];
    if (topCities) {
      try { parsedCities = JSON.parse(topCities); } catch (_) {}
    }

    const newArtist = new Artist({
      name, bio,
      imageUrl, bannerUrl,
      monthlyListeners: monthlyListeners || 0,
      worldRank: worldRank || null,
      topCities: parsedCities,
      galleryImages,
    });
    await newArtist.save();
    res.status(201).json({ success: true, message: "Artist əlavə edildi!", artist: newArtist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllArtists = async (req, res) => {
  try {
    const artists = await Artist.find();
    res.status(200).json({ artists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getArtistByName = async (req, res) => {
  try {
    const { name } = req.params;
    const artist = await Artist.findOne({ name: { $regex: name, $options: 'i' } });
    if (!artist) return res.status(404).json({ success: false, message: "Artist tapılmadı!" });
    res.status(200).json({ success: true, artist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const followArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const artist = await Artist.findById(id);
    if (!artist) return res.status(404).json({ success: false, message: "Artist tapılmadı!" });

    const isFollowing = artist.followers.includes(userId);
    if (isFollowing) {
      artist.followers = artist.followers.filter(f => f !== userId);
    } else {
      artist.followers.push(userId);
    }
    await artist.save();
    res.status(200).json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: artist.followers.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getFollowedArtists = async (req, res) => {
  try {
    const { userId } = req.params;
    const artists = await Artist.find({ followers: userId });
    res.status(200).json({ success: true, artists });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Artist.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Artist tapılmadı!" });
    }
    res.status(200).json({ success: true, message: "Artist silindi!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateArtist = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    if (updateData.topCities) {
      try { updateData.topCities = JSON.parse(updateData.topCities); } catch (_) {}
    }

    if (req.files) {
      if (req.files['image']) updateData.imageUrl = req.files['image'][0].path;
      if (req.files['banner']) updateData.bannerUrl = req.files['banner'][0].path;
      if (req.files['gallery']) {
        const newGallery = req.files['gallery'].map(f => f.path);
        // Mövcud şəkillərə əlavə et
        const existing = await Artist.findById(id);
        updateData.galleryImages = [...(existing?.galleryImages || []), ...newGallery];
      }
    }

    const updated = await Artist.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ success: true, message: "Artist yeniləndi!", artist: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { addArtist, getAllArtists, getArtistByName, followArtist, getFollowedArtists, deleteArtist, updateArtist };