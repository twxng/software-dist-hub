import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { contentService } from "../services/contentService";
import { ContentUnit } from "../types/content";
import { formatImageUrl } from "../utils/imageUtils";
import ReactStars from "react-rating-stars-component";
import "../styles/components/Home.css";

const Popular = () => {
  const [contentItems, setContentItems] = useState<ContentUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedItemIds, setLoadedItemIds] = useState<number[]>([]);
  const [votingInProgress, setVotingInProgress] = useState<number[]>([]);
  const navigate = useNavigate();

  const fetchContentScore = async (contentId: number) => {
    try {
      console.log(`Fetching score for popular content ${contentId}...`);
      const scoreResponse = await contentService.getContentScore(contentId);

      if (scoreResponse.statusCode === 200) {
        console.log(
          `Got score for popular content ${contentId}: ${scoreResponse.data}`
        );
        setContentItems((prevItems) =>
          prevItems
            .map((item) =>
              item.id === contentId
                ? { ...item, score: scoreResponse.data }
                : item
            )
            .sort((a, b) => b.score - a.score)
        );
      } else {
        console.warn(`Failed to get score for popular content ${contentId}`);
      }
    } catch (error) {
      console.error(
        `Error getting score for popular content ${contentId}:`,
        error
      );
    }
  };

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);

        const addContentItem = (item: ContentUnit) => {
          setContentItems((prevItems) => {
            if (prevItems.some((existingItem) => existingItem.id === item.id)) {
              return prevItems;
            }

            return [...prevItems, item].sort((a, b) => b.score - a.score);
          });

          setLoadedItemIds((prev) => [...prev, item.id]);

          fetchContentScore(item.id);
        };

        const response = await contentService.getPopularContent(addContentItem);

        if (response.statusCode === 200) {
          console.log("Popular content retrieval completed:", response.message);

          if (response.data && response.data.length > 0) {
            response.data.forEach((item) => {
              fetchContentScore(item.id);
            });
          }

          setIsLoading(false);
        } else {
          console.error("Error retrieving popular content:", response.message);
          setError(response.message || "Failed to load popular programs");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error loading popular programs:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  const handleCardClick = (id: number) => {
    navigate(`/content/${id}`);
  };

  const handleUpvote = async (event: React.MouseEvent, contentId: number) => {
    event.stopPropagation();
    if (votingInProgress.includes(contentId)) return;

    try {
      setVotingInProgress((prev) => [...prev, contentId]);
      const response = await contentService.upvoteContent(contentId);

      if (response.statusCode === 200) {
        const scoreResponse = await contentService.getContentScore(contentId);

        if (scoreResponse.statusCode === 200) {
          setContentItems((prevItems) =>
            prevItems
              .map((item) =>
                item.id === contentId
                  ? { ...item, score: scoreResponse.data }
                  : item
              )
              .sort((a, b) => b.score - a.score)
          );
        } else {
          setContentItems((prevItems) =>
            prevItems
              .map((item) =>
                item.id === contentId
                  ? { ...item, score: item.score + 1 }
                  : item
              )
              .sort((a, b) => b.score - a.score)
          );
        }
      } else {
        console.error("Error upvoting content:", response.message);
      }
    } catch (error) {
      console.error("Error upvoting:", error);
    } finally {
      setVotingInProgress((prev) => prev.filter((id) => id !== contentId));
    }
  };

  const handleDownvote = async (event: React.MouseEvent, contentId: number) => {
    event.stopPropagation();
    if (votingInProgress.includes(contentId)) return;

    try {
      setVotingInProgress((prev) => [...prev, contentId]);
      const response = await contentService.downvoteContent(contentId);

      if (response.statusCode === 200) {
        const scoreResponse = await contentService.getContentScore(contentId);

        if (scoreResponse.statusCode === 200) {
          setContentItems((prevItems) =>
            prevItems
              .map((item) =>
                item.id === contentId
                  ? { ...item, score: scoreResponse.data }
                  : item
              )
              .sort((a, b) => b.score - a.score)
          );
        } else {
          setContentItems((prevItems) =>
            prevItems
              .map((item) =>
                item.id === contentId
                  ? { ...item, score: item.score - 1 }
                  : item
              )
              .sort((a, b) => b.score - a.score)
          );
        }
      } else {
        console.error("Error downvoting content:", response.message);
      }
    } catch (error) {
      console.error("Error downvoting:", error);
    } finally {
      setVotingInProgress((prev) => prev.filter((id) => id !== contentId));
    }
  };

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1 className="home-title">Popular Programs</h1>
        <p className="home-description">
          Most popular software on our platform
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
            contentItems.map((item, index) => (
              <div
                key={item.id}
                className={`content-card ${
                  loadedItemIds.includes(item.id) ? "content-card-appear" : ""
                }`}
                onClick={() => handleCardClick(item.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {index < 3 && (
                  <div className={`popular-badge rank-${index + 1}`}>
                    #{index + 1}
                  </div>
                )}
                <div className="content-card-image">
                  <img
                    src={formatImageUrl(item.previewImage)}
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

                  <div className="content-card-rating">
                    <div className="rating-stars-container">
                      <ReactStars
                        count={5}
                        value={Math.min(Math.max(item.score / 2, 0), 5)}
                        size={24}
                        edit={false}
                        isHalf={true}
                        activeColor="#ffd700"
                      />
                      <span className="rating-value">{item.score || 0}</span>
                    </div>
                    <div className="rating-buttons">
                      <button
                        className={`rating-button downvote ${
                          votingInProgress.includes(item.id) ? "disabled" : ""
                        }`}
                        onClick={(e) => handleDownvote(e, item.id)}
                        disabled={votingInProgress.includes(item.id)}
                        aria-label="Downvote"
                      >
                        <span>-</span>
                      </button>
                      <button
                        className={`rating-button upvote ${
                          votingInProgress.includes(item.id) ? "disabled" : ""
                        }`}
                        onClick={(e) => handleUpvote(e, item.id)}
                        disabled={votingInProgress.includes(item.id)}
                        aria-label="Upvote"
                      >
                        <span>+</span>
                      </button>
                    </div>
                  </div>

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

export default Popular;
