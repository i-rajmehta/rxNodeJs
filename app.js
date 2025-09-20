const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

async function connectMongo() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.use(express.static('public'));
        app.set('trust proxy', 1) // trust first proxy

        app.use('/api', require('./src/routes/appRoutes'));

        app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
    } catch (error) {
        console.error('Error:', error);
    }
}

connectMongo();
