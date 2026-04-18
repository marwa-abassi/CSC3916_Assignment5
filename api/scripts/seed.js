/**
 * Populate MongoDB with sample movies (>=5 for Assignment 5) and at least one review each.
 * Run: npm run seed   (requires DB in .env)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const path = require('path');

const mongoUri = process.env.MONGO_URI || process.env.DB;
if (!mongoUri) {
  console.error('Set MONGO_URI or DB in your .env file (MongoDB connection string).');
  process.exit(1);
}

const SEED_TITLES = [
  'The Good, the Bad and the Ugly',
  'Inception',
  'Spirited Away',
  'The Dark Knight',
  'Parasite',
  'Casablanca'
];

const movieDocs = [
  {
    title: 'The Good, the Bad and the Ugly',
    releaseDate: 1966,
    genre: 'Western',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/4/45/Good_the_bad_and_the_ugly_poster.jpg',
    actors: [
      { actorName: 'Clint Eastwood', characterName: 'Blondie' },
      { actorName: 'Eli Wallach', characterName: 'Tuco' },
      { actorName: 'Lee Van Cleef', characterName: 'Angel Eyes' }
    ]
  },
  {
    title: 'Inception',
    releaseDate: 2010,
    genre: 'Sci-Fi',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7f/Inception_ver3.jpg',
    actors: [
      { actorName: 'Leonardo DiCaprio', characterName: 'Cobb' },
      { actorName: 'Joseph Gordon-Levitt', characterName: 'Arthur' },
      { actorName: 'Elliot Page', characterName: 'Ariadne' }
    ]
  },
  {
    title: 'Spirited Away',
    releaseDate: 2001,
    genre: 'Animation',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/d/db/Spirited_Away_Japanese_poster.png',
    actors: [
      { actorName: 'Rumi Hiiragi', characterName: 'Chihiro Ogino' },
      { actorName: 'Miyu Irino', characterName: 'Haku' }
    ]
  },
  {
    title: 'The Dark Knight',
    releaseDate: 2008,
    genre: 'Action',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg',
    actors: [
      { actorName: 'Christian Bale', characterName: 'Bruce Wayne' },
      { actorName: 'Heath Ledger', characterName: 'Joker' },
      { actorName: 'Aaron Eckhart', characterName: 'Harvey Dent' }
    ]
  },
  {
    title: 'Parasite',
    releaseDate: 2019,
    genre: 'Thriller',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.jpg',
    actors: [
      { actorName: 'Song Kang-ho', characterName: 'Kim Ki-taek' },
      { actorName: 'Choi Woo-shik', characterName: 'Kim Ki-woo' }
    ]
  },
  {
    title: 'Casablanca',
    releaseDate: 1942,
    genre: 'Drama',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/CasablancaPoster-Gold.jpg',
    actors: [
      { actorName: 'Humphrey Bogart', characterName: 'Rick Blaine' },
      { actorName: 'Ingrid Bergman', characterName: 'Ilsa Lund' }
    ]
  }
];

async function run() {
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const Movie = require(path.join(__dirname, '..', 'Movies'));
  const Review = require(path.join(__dirname, '..', 'Reviews'));
  const User = require(path.join(__dirname, '..', 'Users'));

  const old = await Movie.find({ title: { $in: SEED_TITLES } }).select('_id');
  const oldIds = old.map((d) => d._id);
  if (oldIds.length) {
    await Review.deleteMany({ movieId: { $in: oldIds } });
    await Movie.deleteMany({ _id: { $in: oldIds } });
  }

  const movies = await Movie.insertMany(movieDocs);

  const seedRatings = [5, 4, 3, 5, 4, 3];
  for (let i = 0; i < movies.length; i++) {
    const m = movies[i];
    await Review.create({
      movieId: m._id,
      username: 'demo_critic',
      review: `Really enjoyed ${m.title} — strong ${m.genre.toLowerCase()} pick.`,
      rating: seedRatings[i % seedRatings.length]
    });
  }

  const demoUser = {
    name: 'Demo Student',
    username: 'demo_student@example.com',
    password: 'DemoPass123'
  };
  await User.deleteOne({ username: demoUser.username });
  await new User(demoUser).save();

  console.log(`Seeded ${movies.length} movies, ${movies.length} reviews, and 1 demo user.`);
  console.log('Demo sign-in (POST /signin):');
  console.log(`  username: ${demoUser.username}`);
  console.log(`  password: ${demoUser.password}`);
  console.log('\nMovie IDs (use in GET /movies/:id and POST /reviews):');
  movies.forEach((m) => console.log(`  ${m._id}  ${m.title}`));

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
