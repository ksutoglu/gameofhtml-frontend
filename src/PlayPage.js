import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Container, Form, ListGroup, Badge } from "react-bootstrap";

function PlayPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { title, url } = location.state || {};
  const [comments, setComments] = useState([]);
  const [username, setUsername] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  var api = "https://gameofhtml-backend.onrender.com";
  const pageURL = `https://www.gameofhtml.com/play/${gameId}`;
  const baseUrl = url.endsWith("/") ? url : url + "/";
  const iframeSrc = `${baseUrl}?gd_sdk_referrer_url=${pageURL}`;

  // Yorumları yükle
  useEffect(() => {
    fetch ( api + `/comments?game_id=${gameId}`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error("Yorumlar alınamadı:", err));
  }, [api, gameId]);

  // Yorum gönder
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(api+"/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game_id: gameId,
        username,
        comment,
        rating: parseInt(rating)
      }),
    })
    .then(res => res.json())
    .then(data => {
      setUsername("");
      setComment("");
      setRating(5);
      // Yorumu tekrar yükle
      return fetch(api+`/comments?game_id=${gameId}`);
    })
    .then(res => res.json())
    .then(data => setComments(data));
  };

  if (!url) return <p>Oyun bulunamadı</p>;

  return (
    <Container className="mt-4">
      <h2 className="text-center">{title}</h2>
      <Button variant="secondary" onClick={() => navigate(-1)} className="mb-3">← Geri</Button>

      {/* Oyun iframe */}
      <div style={{ width: "100%", height: "600px", border: "1px solid #ccc", marginBottom: "30px" }}>
        <iframe
          src={iframeSrc}
          title={title}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
        />
      </div>

      {/* Yorum Formu */}
      <h4>Yorum Yap</h4>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-2">
          <Form.Control
            placeholder="İsminiz"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Yorumunuz"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Puan:</Form.Label>
          <Form.Select value={rating} onChange={(e) => setRating(e.target.value)}>
            {[5,4,3,2,1].map(num => (
              <option key={num} value={num}>{num} ⭐</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Button type="submit" variant="primary">Gönder</Button>
      </Form>

      {/* Yorum Listesi */}
      <h5 className="mt-5">Yorumlar</h5>
      <ListGroup>
        {comments.length === 0 ? (
          <ListGroup.Item>Henüz yorum yapılmamış.</ListGroup.Item>
        ) : (
          comments.map((c, i) => (
            <ListGroup.Item key={i}>
              <strong>{c.username}</strong> {" "}
              <Badge bg="warning" className="me-2">{c.rating} ⭐</Badge><br />
              <em>{c.comment}</em><br />
              <small className="text-muted">{new Date(c.created_at).toLocaleString()}</small>
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </Container>
  );
}

export default PlayPage;
