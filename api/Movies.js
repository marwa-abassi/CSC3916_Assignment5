var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Connect to MongoDB (safe if DB env var isn't set yet).
try {
    var mongoUri = process.env.MONGO_URI || process.env.DB;
    if (mongoUri && mongoose.connection.readyState === 0) {
        mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, function () { console.log("connected"); });
    }
} catch (error) {
    console.log("could not connect");
}

// Assignment 5 sample schema (genre enum + release year bounds + imageUrl).
var genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Fantasy', 'Horror', 'Sci-Fi', 'Western', 'Thriller', 'Romance', 'Other'
];

var ActorSchema = new Schema({
    actorName: { type: String, required: true },
    characterName: { type: String, required: true }
}, { _id: false });

var MovieSchema = new Schema({
    title: { type: String, required: true, index: true },
    releaseDate: {
        type: Number,
        required: true,
        min: [1900, 'Must be greater than 1899'],
        max: [2100, 'Must be less than 2100']
    },
    genre: { type: String, required: true, enum: genres },
    actors: { type: [ActorSchema], required: true },
    imageUrl: { type: String }
});

module.exports = mongoose.model('Movie', MovieSchema);
