require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const songRoutes = require('./routes/songRoutes');
const userRoutes = require('./routes/userRoutes'); 
const artistRoutes = require('./routes/artistRoutes'); 

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true })); 

app.use('/api/songs', songRoutes);
app.use('/api/auth', userRoutes); 
app.use('/api/artists', artistRoutes); 

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.error('Error connecting to MongoDB', err);
    });

app.get('/', (req, res) => {
    res.send('Spotify Backend is running with Auth!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});