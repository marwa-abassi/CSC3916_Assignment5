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

// Review schema
var ReviewSchema = new Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    username: { type: String, required: true },
    review: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 }
});

// return the model
// Force the collection name to match the assignment rubric.
module.exports = mongoose.model('Review', ReviewSchema, 'Reviews');