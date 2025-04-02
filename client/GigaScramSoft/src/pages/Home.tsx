import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { contentService } from "../services/contentService";
import { ContentUnit } from "../types/content";
import "../styles/components/Home.css";

const Home = () => {
  const [contentItems, setContentItems] = useState<ContentUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedItemIds, setLoadedItemIds] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);

        const addContentItem = (item: ContentUnit) => {
          setContentItems((prevItems) => {
            if (prevItems.some((existingItem) => existingItem.id === item.id)) {
              return prevItems;
            }

            return [...prevItems, item].sort((a, b) => a.id - b.id);
          });

          setLoadedItemIds((prev) => [...prev, item.id]);

          setIsLoading(false);
        };
        const response = await contentService.getAllContent(addContentItem);

        if (response.statusCode === 200) {
          console.log("Content retrieval completed:", response.message);

          setIsLoading(false);
        } else {
          console.error("Error retrieving content:", response.message);
          setError(response.message || "Failed to load programs");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error loading programs:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  const handleCardClick = (id: number) => {
    navigate(`/content/${id}`);
  };

  return (
    <div className="home-container">
      <div className="home-hero">
        <h2 className="home-subtitle">Welcome to</h2>
        <h1 className="home-title">Software Distribution Hub</h1>
        <p className="home-description">
          Find and download the best software for your needs
        </p>
      </div>

      {isLoading && contentItems.length === 0 ? (
        <div className="content-loading">
          <div className="loading-spinner"></div>
          <p>Loading</p>
        </div>
      ) : error ? (
        <div className="content-error">
          <p>{error}</p>
        </div>
      ) : (
        <div className="content-cards-container">
          {contentItems.length === 0 ? (
            <p className="no-content">No programs found</p>
          ) : (
            contentItems.map((item) => (
              <div
                key={item.id}
                className={`content-card ${
                  loadedItemIds.includes(item.id) ? "content-card-appear" : ""
                }`}
                onClick={() => handleCardClick(item.id)}
              >
                <div className="content-card-image">
                  <img
                    src={item.previewImage}
                    alt={item.header}
                    onLoad={() => {
                      if (!loadedItemIds.includes(item.id)) {
                        setLoadedItemIds((prev) => [...prev, item.id]);
                      }
                    }}
                  />
                </div>
                <div className="content-card-info">
                  <h3 className="content-card-title">{item.header}</h3>
                  <p className="content-card-description">
                    {item.shortDescription}
                  </p>
                  <button className="view-more-button">View more ➔</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
