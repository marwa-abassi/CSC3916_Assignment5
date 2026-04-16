# Assignment Five

## Purpose

Build a React single-page application that talks to your movie + reviews API: browse top-rated movies, open a detail view (image, actors, average rating, review grid), sign up / log in, and submit reviews tied to the JWT user.

## Repository layout

Everything for this assignment lives in **one repo** with two apps side by side:

| Folder | What it is |
|--------|------------|
| **`api/`** | Node / Express / Mongo API (JWT, movies, reviews, search). Former HW4 project. |
| **`client/`** | Create React App (signup, login, movie list, detail, review form). Former Assignment 3 React app. |

Run and deploy each folder independently (`api` on Render/Heroku/etc., `client` on Netlify/Vercel/etc.).

## Pre-requirements

- MongoDB connection string
- Node.js LTS

## Local setup

### 1. API (`api/`)

```bash
cd api
npm install
```

Create **`api/.env`** (do not commit):

- `MONGO_URI` or `DB` — Mongo connection string  
- `SECRET_KEY` — string used to sign JWTs  
- `PORT` — optional (defaults to `8080`)

Seed sample movies + reviews (optional):

```bash
npm run seed
```

Start the API:

```bash
npm start
```

### 2. React client (`client/`)

```bash
cd client
npm install
```

Create **`client/.env`**:

```bash
REACT_APP_API_URL=http://localhost:8080
```

Use your **deployed** API URL for production builds (no trailing slash), for example:

```bash
REACT_APP_API_URL=https://your-api.onrender.com
```

Start the app:

```bash
npm start
```

Open the URL shown in the terminal (usually [http://localhost:3000](http://localhost:3000)). This project uses **HashRouter** (`/#/...` URLs), which works well on static hosts.

## Requirements checklist (course)

- Movie documents support an **`imageUrl`** field; UI shows posters when present.
- Data routes use **JWT** (`Authorization: JWT <token>` from sign-in). Sign-up and sign-in stay public so users can obtain a token.
- **Sign up** (name, username, password) and **log in** (username, password) against your User collection.
- **Main screen**: at least five movies when seeded; **`GET /movies`** sorts by **average rating on the server** (see `api/server.js`). Use **`GET /movies?reviews=true`** from the client to include review data for the carousel.
- **Detail screen**: title, image, actors, **average rating** from aggregation, **grid** of reviews (username, rating, text).
- **Submit review** on the detail page; **username** on the review comes from the **JWT** on the server.
- **Extra credit**: **`POST /movies/search`** with partial title / actor match; client shows results in a **grid**.

## Deployment

1. Deploy **`api/`** and set `MONGO_URI`, `SECRET_KEY`, and `PORT` on the host.  
2. Enable **CORS** for your deployed client origin if needed.  
3. Deploy **`client/`** (build output or static site). Set **`REACT_APP_API_URL`** in the host’s environment to your **live API base URL** so the grader hits the correct endpoint.

## Rubric reminders

- Comments on reviews must save correctly.
- Average rating must come from **aggregation**, not only client-side math.
- Point the React **`REACT_APP_API_URL`** at the correct deployed API.
- React app must be **deployed** for full credit.

## Resources

- [Create React App](https://github.com/facebook/create-react-app)  
- [Heroku CRA buildpack (legacy reference)](https://github.com/mars/create-react-app-buildpack#user-content-requires)
