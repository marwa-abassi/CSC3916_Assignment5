/*
CSC3916 HW4
File: Server.js
Description: Web API scaffolding for Movie API
 */

require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var mongoose = require('mongoose');
var https = require('https');
var crypto = require('crypto');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

/*
 * JWT (Assignment 5): every JSON route below uses authJwtController.isAuthenticated
 * except POST /signup and POST /signin (users must be able to register and obtain a token).
 */

function reviewsCollectionName() {
    return Review.collection.name;
}

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

function sendAnalyticsEventForMovieReview(movie, reqPath) {
    // Extra credit only. If GA key isn't configured, do nothing.
    if (!process.env.GA_KEY) return Promise.resolve();

    const GA_TRACKING_ID = process.env.GA_KEY;
    const category = movie.genre;
    const action = reqPath; // e.g. "post /reviews"
    const label = 'API Request for Movie Review';
    const value = 1;
    const dimension = movie.title; // custom dimension cd1
    const metric = 1; // custom metric cm1

    const params = {
        v: '1',
        tid: GA_TRACKING_ID,
        cid: crypto.randomBytes(16).toString('hex'),
        t: 'event',
        ec: category,
        ea: action,
        el: label,
        ev: value,
        cd1: dimension,
        cm1: metric
    };

    const url = 'https://www.google-analytics.com/collect?' + new URLSearchParams(params).toString();

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            // GA collect returns empty body for measurement protocol.
            res.on('data', () => {});
            res.on('end', () => resolve());
        }).on('error', reject);
    });
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        return res.json({success: false, msg: 'Please include both username and password to signup.'});
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            return res.status(500).send(err);
        }
        if (!user) {
            return res.status(401).json({ success: false, msg: 'Authentication failed.' });
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                return res.json({ success: true, token: 'JWT ' + token });
            }
            return res.status(401).json({ success: false, msg: 'Authentication failed.' });
        });
    });
});

// Create a new movie (protected by JWT)
router.post('/movies', authJwtController.isAuthenticated, async function (req, res) {
    try {
        const { title, releaseDate, genre, actors, imageUrl } = req.body || {};
        if (!title || releaseDate === undefined || !genre || !Array.isArray(actors)) {
            return res.status(400).json({ message: 'Missing required movie fields.' });
        }

        const created = await Movie.create({ title, releaseDate, genre, actors, imageUrl });
        return res.status(200).json(created);
    } catch (err) {
        return res.status(500).json(err);
    }
});

// Get all movies (protected by JWT). Always rank by average rating server-side (Assignment 5).
// If ?reviews=true, the response includes the joined review documents in the "reviews" array.
router.get('/movies', authJwtController.isAuthenticated, async function (req, res) {
    try {
        const includeReviews = String(req.query.reviews).toLowerCase() === 'true';
        var fromReviews = reviewsCollectionName();
        var pipeline = [
            {
                $lookup: {
                    from: fromReviews,
                    localField: '_id',
                    foreignField: 'movieId',
                    as: 'reviews'
                }
            },
            {
                $addFields: {
                    avgRating: { $ifNull: [{ $avg: '$reviews.rating' }, 0] }
                }
            },
            { $sort: { avgRating: -1, title: 1 } }
        ];

        if (!includeReviews) {
            pipeline.push({ $project: { reviews: 0 } });
        }

        const movies = await Movie.aggregate(pipeline);
        return res.status(200).json(movies);
    } catch (err) {
        return res.status(500).json(err);
    }
});

// Extra credit: partial match on movie title or actor names (POST, JWT).
router.post('/movies/search', authJwtController.isAuthenticated, async function (req, res) {
    try {
        var raw = (req.body && req.body.query) ? String(req.body.query) : '';
        var q = raw.trim();
        if (!q) {
            return res.status(400).json({ message: 'Body must include non-empty "query".' });
        }
        var esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var regex = new RegExp(esc, 'i');
        var movies = await Movie.find({
            $or: [
                { title: regex },
                { 'actors.actorName': regex },
                { 'actors.characterName': regex }
            ]
        })
            .limit(50)
            .lean();
        return res.status(200).json(movies);
    } catch (err) {
        return res.status(500).json(err);
    }
});

// Get a single movie.
// If ?reviews=true then include reviews (via $lookup) and avgRating (Assignment 5).
router.get('/movies/:id', authJwtController.isAuthenticated, async function (req, res) {
    try {
        const movieId = req.params.id;
        const includeReviews = String(req.query.reviews).toLowerCase() === 'true';

        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return res.status(400).json({ message: 'Invalid movie id.' });
        }

        if (!includeReviews) {
            const movie = await Movie.findById(movieId);
            if (!movie) return res.status(404).json({ message: 'Movie not found.' });
            return res.status(200).json(movie);
        }

        var fromReviews = reviewsCollectionName();
        const results = await Movie.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(movieId) } },
            {
                $lookup: {
                    from: fromReviews,
                    localField: '_id',
                    foreignField: 'movieId',
                    as: 'reviews'
                }
            },
            {
                $addFields: {
                    avgRating: { $ifNull: [{ $avg: '$reviews.rating' }, 0] }
                }
            }
        ]);

        if (!results || results.length === 0) {
            return res.status(404).json({ message: 'Movie not found.' });
        }

        return res.status(200).json(results[0]);
    } catch (err) {
        return res.status(500).json(err);
    }
});

// Get reviews (protected by JWT).
// If ?movieId=<id> is provided, only returns reviews for that movie.
router.get('/reviews', authJwtController.isAuthenticated, async function (req, res) {
    try {
        const movieId = req.query.movieId;
        const filter = {};

        if (movieId !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(movieId)) {
                return res.status(400).json({ message: 'Invalid movie id.' });
            }
            filter.movieId = movieId;
        }

        const reviews = await Review.find(filter);
        return res.status(200).json(reviews);
    } catch (err) {
        return res.status(500).json(err);
    }
});

// Create a review for a movie (protected by JWT).
// Username is taken from the JWT (req.user).
router.post('/reviews', authJwtController.isAuthenticated, async function (req, res) {
    try {
        const { movieId, review, rating } = req.body || {};

        if (!movieId || !review || rating === undefined) {
            return res.status(400).json({ message: 'Missing required review fields.' });
        }

        const ratingNum = Number(rating);
        if (Number.isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
            return res.status(400).json({ message: 'Rating must be a number between 0 and 5.' });
        }
        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return res.status(400).json({ message: 'Invalid movie id.' });
        }

        const movie = await Movie.findById(movieId);
        if (!movie) return res.status(404).json({ message: 'Movie not found.' });

        // passport-jwt attaches the user doc as req.user
        const username = req.user && req.user.username ? req.user.username : null;
        if (!username) return res.status(401).json({ message: 'Unauthorized.' });

        await Review.create({ movieId, username, review, rating: ratingNum });

        // Extra credit analytics (fire-and-forget)
        sendAnalyticsEventForMovieReview(movie, 'post /reviews').catch(() => {});

        return res.status(200).json({ message: 'Review created!' });
    } catch (err) {
        return res.status(500).json(err);
    }
});

// Optional: delete a review (protected by JWT)
router.delete('/reviews/:id', authJwtController.isAuthenticated, async function (req, res) {
    try {
        const reviewId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ message: 'Invalid review id.' });
        }

        const result = await Review.deleteOne({ _id: reviewId });
        return res.status(200).json({ deletedCount: result.deletedCount });
    } catch (err) {
        return res.status(500).json(err);
    }
});

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


