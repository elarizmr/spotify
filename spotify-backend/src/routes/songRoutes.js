const express = require('express');
const router = express.Router();
const { addSong, getAllSongs, getSongById, deleteSong, updateSong, getSongsByArtist, getRandomSongs, searchSongs, migrateArtistIds, incrementPlays } = require('../controllers/songController');
const { upload } = require('../config/cloudinary');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/', getAllSongs);
router.get('/random', getRandomSongs);
router.get('/search', searchSongs);
router.get('/migrate-artist-ids', migrateArtistIds);
router.get('/artist/:artistName', getSongsByArtist);
router.get('/:id', getSongById);
router.post('/:id/play', incrementPlays);

router.post('/add', auth, isAdmin, upload.fields([{ name: 'audio' }, { name: 'image' }]), addSong);
router.delete('/:id', auth, isAdmin, deleteSong);
router.put('/:id', auth, isAdmin, upload.fields([{ name: 'audio' }, { name: 'image' }]), updateSong);

module.exports = router;