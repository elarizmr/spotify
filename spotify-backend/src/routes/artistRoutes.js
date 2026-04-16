const express = require('express');
const router = express.Router();
const { getAllArtists, addArtist, deleteArtist, updateArtist, getArtistByName, followArtist, getFollowedArtists } = require('../controllers/artistController');
const { upload } = require('../config/cloudinary');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const artistUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
]);

router.get('/', getAllArtists);
router.get('/followed/:userId', getFollowedArtists);
router.get('/name/:name', getArtistByName);
router.post('/:id/follow', followArtist);

router.post('/add', auth, isAdmin, artistUpload, addArtist);
router.delete('/:id', auth, isAdmin, deleteArtist);
router.put('/:id', auth, isAdmin, artistUpload, updateArtist);

module.exports = router;