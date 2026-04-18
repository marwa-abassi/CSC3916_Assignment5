import actionTypes from '../constants/actionTypes';
//import runtimeEnv from '@mars/heroku-js-runtime-env'
const env = process.env;

function moviesFetched(movies) {
    return {
        type: actionTypes.FETCH_MOVIES,
        movies: movies
    }
}

function movieFetched(movie) {
    return {
        type: actionTypes.FETCH_MOVIE,
        selectedMovie: movie
    }
}

function movieSet(movie) {
    return {
        type: actionTypes.SET_MOVIE,
        selectedMovie: movie
    }
}

export function setMovie(movie) {
    return dispatch => {
        dispatch(movieSet(movie));
    }
}

export function fetchMovie(movieId) {
    return dispatch => {
        return fetch(`${env.REACT_APP_API_URL}/movies/${encodeURIComponent(movieId)}?reviews=true`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            mode: 'cors'
        }).then((response) => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json()
        }).then((res) => {
            dispatch(movieFetched(res));
        }).catch((e) => console.log(e));
    }
}

export function fetchMovies() {
    return dispatch => {
        return fetch(`${env.REACT_APP_API_URL}/movies?reviews=true`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            mode: 'cors'
        }).then((response) => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json()
        }).then((res) => {
            dispatch(moviesFetched(res));
        }).catch((e) => console.log(e));
    }
}

/** Extra credit: partial title or actor search (POST /movies/search). Returns array of movies. */
export function searchMovies(query) {
    return function searchMoviesThunk() {
        return fetch(`${env.REACT_APP_API_URL}/movies/search`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({ query }),
            mode: 'cors'
        }).then((response) => {
            if (!response.ok) {
                return response.json().then((body) => {
                    throw new Error(body.message || response.statusText);
                });
            }
            return response.json();
        });
    };
}

export function submitReview(movieId, payload) {
    const { review, rating } = payload;
    return dispatch => {
        return fetch(`${env.REACT_APP_API_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({
                movieId,
                review,
                rating: Number(rating)
            }),
            mode: 'cors'
        }).then((response) => {
            return response.json().then((body) => ({ ok: response.ok, body }));
        }).then(({ ok, body }) => {
            if (!ok) {
                throw new Error(body.message || 'Failed to submit review');
            }
            return dispatch(fetchMovie(movieId));
        }).catch((e) => {
            console.error(e);
            throw e;
        });
    };
}