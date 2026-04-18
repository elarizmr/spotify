const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);


router.get('/liked', auth, authController.getLikedSongs);
router.post('/liked/:songId', auth, authController.toggleLikeSong);


router.get('/playlists', auth, authController.getPlaylists);
router.post('/playlists', auth, authController.createPlaylist);
router.post('/playlists/:playlistId/songs/:songId', auth, authController.addSongToPlaylist);
router.delete('/playlists/:playlistId', auth, authController.deletePlaylist);

module.exports = router;