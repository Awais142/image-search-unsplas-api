import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";

const App = () => {
  const [term, setTerm] = useState("");
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filters, setFilters] = useState({
    orientation: "",
    color: "",
    orderBy: "relevant",
  });

  const Access_Key = "95CwQS0o4ft98skiJixsAYHIzAXrj9ER2R_4tlKvEio";

  const onFormSubmit = async (event) => {
    event.preventDefault();
    setPage(1);
    fetchImages();
  };

  const fetchImages = async (newPage = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        query: term,
        page: newPage,
        per_page: 12,
        orientation: filters.orientation || undefined,
        order_by: filters.orderBy,
        client_id: Access_Key,
      });

      // Only add color if it's selected
      if (filters.color) {
        params.append('color', filters.color);
      }

      const response = await fetch(
        `https://api.unsplash.com/search/photos?${params}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0] || 'Failed to fetch images');
      }

      const data = await response.json();
      setImages(prev => newPage === 1 ? data.results : [...prev, ...data.results]);
      setPage(newPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchImages(page + 1);
  };

  const downloadImage = async (url, imageName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${imageName || 'image'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  return (
    <>
      <h1 className="m-auto d-flex justify-content-center mt-3">
        Image Search Using Unsplash API
      </h1>
      <div className="container mt-5">
        <form onSubmit={onFormSubmit} className="mb-4">
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search for images..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            <div className="input-group-append">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : "Search"}
              </button>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <Form.Select
                value={filters.orientation}
                onChange={(e) => setFilters({ ...filters, orientation: e.target.value })}
              >
                <option value="">Any Orientation</option>
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
                <option value="squarish">Square</option>
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Select
                value={filters.color}
                onChange={(e) => setFilters({ ...filters, color: e.target.value })}
              >
                <option value="">Any Color</option>
                <option value="black_and_white">Black & White</option>
                <option value="black">Black</option>
                <option value="white">White</option>
                <option value="yellow">Yellow</option>
                <option value="orange">Orange</option>
                <option value="red">Red</option>
                <option value="purple">Purple</option>
                <option value="magenta">Magenta</option>
                <option value="green">Green</option>
                <option value="teal">Teal</option>
                <option value="blue">Blue</option>
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Select
                value={filters.orderBy}
                onChange={(e) => setFilters({ ...filters, orderBy: e.target.value })}
              >
                <option value="relevant">Relevance</option>
                <option value="latest">Latest</option>
              </Form.Select>
            </div>
          </div>
        </form>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <div className="row">
          {images.map((image) => (
            <div key={image.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <img
                  src={image.urls.regular}
                  alt={image.alt_description}
                  className="card-img-top cursor-pointer"
                  style={{ height: "200px", objectFit: "cover" }}
                  onClick={() => setSelectedImage(image)}
                />
                <div className="card-body">
                  <p className="card-text text-truncate">{image.description || image.alt_description}</p>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => downloadImage(image.urls.full, image.id)}
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {images.length > 0 && (
          <div className="text-center mb-4">
            <button
              className="btn btn-primary"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Load More"}
            </button>
          </div>
        )}

        <Modal show={!!selectedImage} onHide={() => setSelectedImage(null)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Image Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedImage && (
              <>
                <img
                  src={selectedImage.urls.regular}
                  alt={selectedImage.alt_description}
                  className="img-fluid mb-3"
                />
                <h5>Description</h5>
                <p>{selectedImage.description || selectedImage.alt_description || "No description available"}</p>
                <h5>Photographer</h5>
                <p>{selectedImage.user.name}</p>
                <h5>Stats</h5>
                <p>Likes: {selectedImage.likes}</p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setSelectedImage(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => downloadImage(selectedImage.urls.full, selectedImage.id)}
            >
              Download Full Resolution
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default App;
