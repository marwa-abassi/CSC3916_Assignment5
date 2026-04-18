import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovies, setMovie, searchMovies } from "../actions/movieActions";
import { Link } from 'react-router-dom';
import { Image, Nav, Carousel, Form, Button, Row, Col, Card } from 'react-bootstrap';
import { BsStarFill } from 'react-icons/bs';

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
            <div className="p-3">
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
                                {movie.imageUrl
                                    ? <Card.Img variant="top" src={movie.imageUrl} referrerPolicy="no-referrer" style={{ objectFit: 'cover', maxHeight: '220px' }} />
                                    : <div className="bg-secondary p-5 text-center">No image</div>}
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
        <div className="p-3">
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
            <Carousel onSelect={handleSelect} className="bg-dark text-light p-4 rounded">
                {memoizedMovies.map((movie) => (
                    <Carousel.Item key={movie._id || movie.title}>
                        <Nav.Link
                            as={Link}
                            to={`/movie/${movie._id}`}
                            onClick={() => handleClick(movie)}
                        >
                            {movie.imageUrl ? <Image className="image" src={movie.imageUrl} referrerPolicy="no-referrer" thumbnail alt={movie.title || 'Movie poster'} /> : <div className="image-placeholder p-4 bg-secondary text-light">No image</div>}
                        </Nav.Link>
                        <Carousel.Caption>
                            <h3>{movie.title}</h3>
                            {movie.avgRating != null && <><BsStarFill /> {formatAvg(movie.avgRating)} &nbsp;&nbsp;</>}{movie.releaseDate}
                        </Carousel.Caption>
                    </Carousel.Item>
                ))}
            </Carousel>
        </div>
    );
}

export default MovieList;