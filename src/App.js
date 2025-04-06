import React, { useEffect, useState } from "react";
import {
  Container, Row, Col, Card, Button,
  Badge, ButtonGroup
} from "react-bootstrap";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import PlayPage from "./PlayPage";

function HomePage() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("Hepsi");
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  var api="https://gameofhtml-backend.onrender.com";
  const navigate = useNavigate();

  // localStorage'tan favorileri oku
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(favs);
  }, []);

  // Oyunları çek
  useEffect(() => {
    fetch(api+"/games")
      .then(res => res.json())
      .then(data => {
        setGames(data);
        setFilteredGames(data);

        const allGenres = new Set();
        data.forEach(game => {
          game.genres?.forEach(g => allGenres.add(g));
        });
        setGenres(["Hepsi", "Favoriler", ...Array.from(allGenres)]);
      });
  }, [api]);

  // Filtre değişince oyunları süz
  const handleFilter = (genre) => {
    setSelectedGenre(genre);
    let list = [...games];
  
    if (genre === "Favoriler") {
      list = list.filter(game => favorites.includes(game.id));
    } else if (genre !== "Hepsi") {
      list = list.filter(game => game.genres?.includes(genre));
    }
  
    // Arama terimine göre filtrele
    if (searchTerm.trim() !== "") {
      list = list.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  
    setFilteredGames(list);
  };
  
  useEffect(() => {
    handleFilter(selectedGenre);
  }, [handleFilter, selectedGenre]);
  

  // Favori ekle/çıkar
  const toggleFavorite = (gameId) => {
    let updatedFavs;
    if (favorites.includes(gameId)) {
      updatedFavs = favorites.filter(id => id !== gameId);
    } else {
      updatedFavs = [...favorites, gameId];
    }
    setFavorites(updatedFavs);
    localStorage.setItem("favorites", JSON.stringify(updatedFavs));
  };

  // Favori mi kontrolü
  const isFavorite = (gameId) => favorites.includes(gameId);

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Game of HTML 🎮</h1>

      <input
  type="text"
  className="form-control mb-3"
  placeholder="Oyun adıyla ara..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

      {/* Filtre Butonları */}
      <ButtonGroup className="mb-4 d-flex flex-wrap justify-content-center">
        {genres.map((genre, idx) => (
          <Button
            key={idx}
            variant={genre === selectedGenre ? "primary" : "outline-primary"}
            onClick={() => handleFilter(genre)}
            className="m-1"
          >
            {genre}
          </Button>
        ))}
      </ButtonGroup>

      {/* Oyun Kartları */}
      <Row>
        {filteredGames.map((game, index) => (
          <Col md={4} className="mb-4" key={index}>
            <Card className="h-100 shadow">
              <Card.Img
                variant="top"
                src={game.image || "https://via.placeholder.com/400x200?text=No+Image"}
                alt={game.title}
                style={{ maxHeight: "200px", objectFit: "cover" }}
              />
              <Card.Body>
                <Card.Title>
                  {game.title}
                  <span
                    onClick={() => toggleFavorite(game.id)}
                    style={{ cursor: "pointer", float: "right", color: isFavorite(game.id) ? "gold" : "#ccc" }}
                    title="Favoriye ekle/çıkar"
                  >
                    {isFavorite(game.id) ? "⭐" : "☆"}
                  </span>
                </Card.Title>
                <Card.Text>{game.description?.substring(0, 100)}...</Card.Text>
                <Card.Text>
                  <strong>Nasıl Oynanır:</strong><br />
                  {game.instructions?.substring(0, 80)}...
                </Card.Text>
                {game.genres?.map((genre, i) => (
                  <Badge bg="info" className="me-1" key={i}>{genre}</Badge>
                ))}
              </Card.Body>
              <Card.Footer className="text-center">
                <Button
                  variant="success"
                  onClick={() => navigate(`/play/${game.id}`, {
                    state: {
                      id: game.id,
                      title: game.title,
                      url: game.url
                    }
                  })}
                  
                >
                  Oyunu Oyna
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play/:gameId" element={<PlayPage />} />
      </Routes>
    </Router>
  );
}

export default App;
