import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovies, setMovie, searchMovies } from "../actions/movieActions";
import { Link } from 'react-router-dom';
import { Carousel, Form, Button, Row, Col, Card } from 'react-bootstrap';
import { BsStarFill } from 'react-icons/bs';

/** Wikimedia and other CDNs sometimes fail when hot-linked; avoid broken-icon layout */
const POSTER_FALLBACK =
  'https://placehold.co/400x600/343a40/adb5bd/png?text=Poster+unavailable';

function MovieList() {
    const dispatch = useDispatch();
    const movies = useSelector(state => state.movie.movies);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [searchError, setSearchError] = useState('');

    const memoizedMovies = useMemo(() => {
        return movies;
    }, [movies]);

    useEffect(() => {
        dispatch(fetchMovies());
    }, [dispatch]);

    const handleSelect = (selectedIndex) => {
        dispatch(setMovie(memoizedMovies[selectedIndex]));
    };

    const handleClick = (movie) => {
        dispatch(setMovie(movie));
    };

    const runSearch = (e) => {
        e.preventDefault();
        setSearchError('');
        const q = searchQuery.trim();
        if (!q) {
            setSearchResults(null);
            return;
        }
        dispatch(searchMovies(q))
            .then((rows) => setSearchResults(Array.isArray(rows) ? rows : []))
            .catch((err) => {
                setSearchError(err.message || 'Search failed');
                setSearchResults([]);
            });
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults(null);
        setSearchError('');
    };

    if (!memoizedMovies) {
        return <div>Loading....</div>;
    }

    const formatAvg = (v) => (v == null ? '' : (typeof v === 'number' ? v.toFixed(1) : v));

    if (searchResults !== null) {
        return (
            <div className="movie-list-page p-3 pb-5">
                <Form className="mb-3 d-flex flex-wrap gap-2 align-items-end" onSubmit={runSearch}>
                    <Form.Group>
                        <Form.Label className="text-light">Search movies / actors</Form.Label>
                        <Form.Control
                            value={searchQuery}
                            onChange={(ev) => setSearchQuery(ev.target.value)}
                            placeholder="Partial title or actor name"
                        />
                    </Form.Group>
                    <Button type="submit" variant="primary">Search</Button>
                    <Button type="button" variant="outline-secondary" onClick={clearSearch}>Top rated</Button>
                </Form>
                {searchError && <p className="text-warning">{searchError}</p>}
                <Row xs={1} sm={2} md={3} className="g-3">
                    {searchResults.map((movie) => (
                        <Col key={movie._id}>
                            <Card className="h-100 bg-dark text-light">
                                {movie.imageUrl ? (
                                    <Card.Img
                                        variant="top"
                                        src={movie.imageUrl}
                                        referrerPolicy="no-referrer"
                                        style={{ objectFit: 'cover', maxHeight: '220px' }}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = POSTER_FALLBACK;
                                        }}
                                    />
                                ) : (
                                    <div className="bg-secondary p-5 text-center">No image</div>
                                )}
                                <Card.Body>
                                    <Card.Title>{movie.title}</Card.Title>
                                    <Card.Text className="small">{movie.releaseDate} · {movie.genre}</Card.Text>
                                    <Button as={Link} to={`/movie/${movie._id}`} variant="outline-light" size="sm" onClick={() => handleClick(movie)}>
                                        Details
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                {searchResults.length === 0 && !searchError && <p className="text-muted mt-2">No matches.</p>}
            </div>
        );
    }

    return (
        <div className="movie-list-page p-3 pb-5">
            <Form className="mb-3 d-flex flex-wrap gap-2 align-items-end" onSubmit={runSearch}>
                <Form.Group>
                    <Form.Label className="text-light">Search movies / actors</Form.Label>
                    <Form.Control
                        value={searchQuery}
                        onChange={(ev) => setSearchQuery(ev.target.value)}
                        placeholder="Partial title or actor name"
                    />
                </Form.Group>
                <Button type="submit" variant="primary">Search</Button>
            </Form>
            <Carousel
                interval={5000}
                indicators
                onSelect={handleSelect}
                className="movie-carousel bg-dark border border-secondary rounded p-3"
            >
                {memoizedMovies.map((movie) => (
                    <Carousel.Item key={movie._id || movie.title}>
                        <div className="d-flex flex-column align-items-center justify-content-center text-center">
                            <Link
                                to={`/movie/${movie._id}`}
                                onClick={() => handleClick(movie)}
                                className="d-inline-block text-decoration-none"
                            >
                                {movie.imageUrl ? (
                                    <img
                                        className="movie-carousel-poster"
                                        src={movie.imageUrl}
                                        alt={movie.title || 'Movie poster'}
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = POSTER_FALLBACK;
                                        }}
                                    />
                                ) : (
                                    <div className="movie-carousel-poster d-flex align-items-center justify-content-center bg-secondary text-light px-4">
                                        No poster
                                    </div>
                                )}
                            </Link>
                            <div className="movie-carousel-meta text-light">
                                <h3 className="h4 mb-1">{movie.title}</h3>
                                <div className="small">
                                    {movie.avgRating != null && (
                                        <>
                                            <BsStarFill className="text-warning" /> {formatAvg(movie.avgRating)}
                                            {' · '}
                                        </>
                                    )}
                                    {movie.releaseDate}
                                </div>
                                <div className="mt-2">
                                    <Button as={Link} to={`/movie/${movie._id}`} variant="outline-light" size="sm" onClick={() => handleClick(movie)}>
                                        Open detail
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel>
        </div>
    );
}

export default MovieList;