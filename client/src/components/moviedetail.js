import React, { useEffect, useState } from 'react';
import { fetchMovie, submitReview } from '../actions/movieActions';
import { useDispatch, useSelector } from 'react-redux';
import { Card, ListGroup, ListGroupItem, Image, Form, Button, Row, Col } from 'react-bootstrap';
import { BsStarFill } from 'react-icons/bs';
import { useParams } from 'react-router-dom';

const MovieDetail = () => {
  const dispatch = useDispatch();
  const { movieId } = useParams();
  const selectedMovie = useSelector(state => state.movie.selectedMovie);
  const loading = useSelector(state => state.movie.loading);
  const error = useSelector(state => state.movie.error);
  const loggedIn = useSelector(state => state.auth.loggedIn);

  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('5');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchMovie(movieId));
  }, [dispatch, movieId]);

  const formatAvg = (v) => (v == null ? '' : (typeof v === 'number' ? Number(v).toFixed(1) : v));

  const onSubmitReview = (ev) => {
    ev.preventDefault();
    setSubmitError('');
    if (!loggedIn) {
      setSubmitError('Please log in to submit a review.');
      return;
    }
    if (!movieId) {
      return;
    }
    const r = Number(rating);
    if (Number.isNaN(r) || r < 0 || r > 5) {
      setSubmitError('Rating must be between 0 and 5.');
      return;
    }
    if (!reviewText.trim()) {
      setSubmitError('Please enter a comment.');
      return;
    }
    setSubmitting(true);
    dispatch(submitReview(movieId, { review: reviewText.trim(), rating: r }))
      .then(() => {
        setReviewText('');
      })
      .catch((e) => {
        setSubmitError(e.message || 'Could not save review.');
      })
      .finally(() => setSubmitting(false));
  };

  const DetailInfo = () => {
    if (loading) {
      return <div>Loading....</div>;
    }

    if (error) {
      return <div>Error: {error}</div>;
    }

    if (!selectedMovie) {
      return <div>No movie data available.</div>;
    }

    return (
      <Card className="bg-dark text-light p-4 rounded">
        <Card.Header className="text-dark">Movie Detail</Card.Header>
        <Card.Body>
          {selectedMovie.imageUrl && <Image className="image" src={selectedMovie.imageUrl} thumbnail alt={selectedMovie.title} />}
        </Card.Body>
        <ListGroup>
          <ListGroupItem>{selectedMovie.title}</ListGroupItem>
          <ListGroupItem>{selectedMovie.releaseDate && <span>Year: {selectedMovie.releaseDate}</span>}</ListGroupItem>
          <ListGroupItem>{selectedMovie.genre && <span>Genre: {selectedMovie.genre}</span>}</ListGroupItem>
          <ListGroupItem>
            {selectedMovie.actors && selectedMovie.actors.length > 0 ? selectedMovie.actors.map((actor, i) => (
              <p key={i} className="mb-1">
                <b>{actor.actorName}</b> — {actor.characterName}
              </p>
            )) : null}
          </ListGroupItem>
          {selectedMovie.avgRating != null && !Number.isNaN(Number(selectedMovie.avgRating)) && (
            <ListGroupItem>
              <h4 className="mb-0">
                Average rating <BsStarFill /> {formatAvg(selectedMovie.avgRating)}
              </h4>
            </ListGroupItem>
          )}
        </ListGroup>

        {loggedIn && (
          <Card.Body className="border-top border-secondary">
            <h5 className="text-light">Add a review</h5>
            <Form onSubmit={onSubmitReview}>
              <Form.Group className="mb-2" controlId="rating">
                <Form.Label>Rating (0–5)</Form.Label>
                <Form.Select value={rating} onChange={(e) => setRating(e.target.value)}>
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={String(n)}>{n}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2" controlId="review">
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you think?"
                />
              </Form.Group>
              {submitError && <p className="text-warning small">{submitError}</p>}
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Saving…' : 'Submit review'}
              </Button>
            </Form>
          </Card.Body>
        )}

        {selectedMovie.reviews && selectedMovie.reviews.length > 0 && (
          <Card.Body className="bg-white text-dark">
            <h5>Reviews</h5>
            <Row xs={1} md={2} className="g-2">
              {selectedMovie.reviews.map((review, i) => (
                <Col key={review._id || i}>
                  <Card border="secondary" className="h-100">
                    <Card.Body>
                      <Card.Title className="h6">{review.username}</Card.Title>
                      <Card.Text className="small mb-1">{review.review}</Card.Text>
                      <Card.Text className="mb-0"><BsStarFill /> {review.rating}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        )}
      </Card>
    );
  };

  return <DetailInfo />;
};

export default MovieDetail;
