import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [term, setTerm] = useState("");
  const [images, setImages] = useState([]);

  const onFormSubmit = async (event) => {
    event.preventDefault();
    const Access_Key = "95CwQS0o4ft98skiJixsAYHIzAXrj9ER2R_4tlKvEio";
    const response = await fetch(
      `https://api.unsplash.com/search/photos?page=1&query=${term}&client_id=${Access_Key}`
    );
    const data = await response.json();
    setImages(data.results);
  };

  return (
    <div className="container mt-5">
      <h1 className="m-auto">Image Search Using Unsplash API </h1>
      <form onSubmit={onFormSubmit} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Search for images..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <div className="input-group-append">
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </div>
        </div>
      </form>
      <div className="row">
        {images.map(({ id, urls, alt_description }) => (
          <div key={id} className="col-md-4 mb-4">
            <div className="card">
              <img
                src={urls.regular}
                alt={alt_description}
                className="card-img-top"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
