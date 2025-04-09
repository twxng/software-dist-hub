import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { contentService } from "../services/contentService";
import { ContentUnit } from "../types/content";
import { formatImageUrl } from "../utils/imageUtils";
import ReactStars from "react-rating-stars-component";
import { useAuthStore } from "../store/authStore";
import "../styles/components/Home.css";

const Home = () => {
  const [contentItems, setContentItems] = useState<ContentUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedItemIds, setLoadedItemIds] = useState<number[]>([]);
  const [votingInProgress, setVotingInProgress] = useState<number[]>([]);
  const [ratingMessages, setRatingMessages] = useState<{
    [key: number]: { type: "success" | "error"; text: string };
  }>({});
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const fetchContentScore = async (contentId: number) => {
    try {
      console.log(`Fetching score for content ${contentId}...`);
      const scoreResponse = await contentService.getContentScore(contentId);

      if (scoreResponse.statusCode === 200) {
        console.log(
          `Got score for content ${contentId}: ${scoreResponse.data}`
        );
        setContentItems((prevItems) =>
          prevItems.map((item) =>
            item.id === contentId
              ? { ...item, score: scoreResponse.data }
              : item
          )
        );
      } else {
        console.warn(`Failed to get score for content ${contentId}`);
      }
    } catch (error) {
      console.error(`Error getting score for content ${contentId}:`, error);
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

            return [...prevItems, item].sort((a, b) => a.id - b.id);
          });

          setLoadedItemIds((prev) => [...prev, item.id]);

          fetchContentScore(item.id);

          setIsLoading(false);
        };
        const response = await contentService.getAllContent(addContentItem);

        if (response.statusCode === 200) {
          console.log("Content retrieval completed:", response.message);

          if (response.data && response.data.length > 0) {
            response.data.forEach((item) => {
              fetchContentScore(item.id);
            });
          }

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

  const showRatingMessage = (
    contentId: number,
    message: { type: "success" | "error"; text: string }
  ) => {
    setRatingMessages((prev) => ({
      ...prev,
      [contentId]: message,
    }));

    setTimeout(() => {
      setRatingMessages((prev) => {
        const newMessages = { ...prev };
        delete newMessages[contentId];
        return newMessages;
      });
    }, 3000);
  };

  const handleUpvote = async (event: React.MouseEvent, contentId: number) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      showRatingMessage(contentId, {
        type: "error",
        text: "Please log in to vote",
      });
      return;
    }

    if (votingInProgress.includes(contentId)) return;

    try {
      setVotingInProgress((prev) => [...prev, contentId]);
      const response = await contentService.upvoteContent(contentId);

      if (response.statusCode === 200) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          const scoreResponse = await contentService.getContentScore(contentId);

          if (scoreResponse.statusCode === 200) {
            console.log(
              `Updated score from server for ID ${contentId}: ${scoreResponse.data}`
            );

            setContentItems((prevItems) =>
              prevItems.map((item) =>
                item.id === contentId
                  ? { ...item, score: scoreResponse.data }
                  : item
              )
            );
          } else {
            console.warn(
              `Failed to get updated score for ID ${contentId}, applying local update`
            );
            setContentItems((prevItems) =>
              prevItems.map((item) =>
                item.id === contentId
                  ? { ...item, score: item.score + 1 }
                  : item
              )
            );
          }
        } catch (scoreError) {
          console.error(
            `Error getting updated score for ID ${contentId}:`,
            scoreError
          );

          setContentItems((prevItems) =>
            prevItems.map((item) =>
              item.id === contentId ? { ...item, score: item.score + 1 } : item
            )
          );
        }

        showRatingMessage(contentId, {
          type: "success",
          text: "Your vote has been counted!",
        });
      } else {
        console.error("Error upvoting content:", response.message);
        showRatingMessage(contentId, {
          type: "error",
          text: response.message || "Error while voting",
        });
      }
    } catch (error) {
      console.error("Error upvoting:", error);
      showRatingMessage(contentId, {
        type: "error",
        text: error instanceof Error ? error.message : "Error while voting",
      });
    } finally {
      setVotingInProgress((prev) => prev.filter((id) => id !== contentId));
    }
  };

  const handleDownvote = async (event: React.MouseEvent, contentId: number) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      showRatingMessage(contentId, {
        type: "error",
        text: "Please log in to vote",
      });
      return;
    }

    if (votingInProgress.includes(contentId)) return;

    try {
      setVotingInProgress((prev) => [...prev, contentId]);
      const response = await contentService.downvoteContent(contentId);

      if (response.statusCode === 200) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          const scoreResponse = await contentService.getContentScore(contentId);

          if (scoreResponse.statusCode === 200) {
            console.log(
              `Updated score from server for ID ${contentId}: ${scoreResponse.data}`
            );

            setContentItems((prevItems) =>
              prevItems.map((item) =>
                item.id === contentId
                  ? { ...item, score: scoreResponse.data }
                  : item
              )
            );
          } else {
            console.warn(
              `Failed to get updated score for ID ${contentId}, applying local update`
            );
            setContentItems((prevItems) =>
              prevItems.map((item) =>
                item.id === contentId
                  ? { ...item, score: item.score - 1 }
                  : item
              )
            );
          }
        } catch (scoreError) {
          console.error(
            `Error getting updated score for ID ${contentId}:`,
            scoreError
          );

          setContentItems((prevItems) =>
            prevItems.map((item) =>
              item.id === contentId ? { ...item, score: item.score - 1 } : item
            )
          );
        }

        showRatingMessage(contentId, {
          type: "success",
          text: "Your vote has been counted!",
        });
      } else {
        console.error("Error downvoting content:", response.message);
        showRatingMessage(contentId, {
          type: "error",
          text: response.message || "Error while voting",
        });
      }
    } catch (error) {
      console.error("Error downvoting:", error);
      showRatingMessage(contentId, {
        type: "error",
        text: error instanceof Error ? error.message : "Error while voting",
      });
    } finally {
      setVotingInProgress((prev) => prev.filter((id) => id !== contentId));
    }
  };

  return (
    <div className="home-container">
      {/* <div className="home-hero">
        <h2 className="home-subtitle">Welcome to</h2>
        <h1 className="home-title">Software Distribution Hub</h1>
        <p className="home-description">
          Find and download the best software for your needs
        </p>
      </div> */}

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
                        } ${!isAuthenticated ? "auth-required" : ""}`}
                        onClick={(e) => handleDownvote(e, item.id)}
                        disabled={votingInProgress.includes(item.id)}
                        aria-label="Downvote"
                        title={isAuthenticated ? "Dislike" : "Log in to vote"}
                      >
                        <span>-</span>
                      </button>
                      <button
                        className={`rating-button upvote ${
                          votingInProgress.includes(item.id) ? "disabled" : ""
                        } ${!isAuthenticated ? "auth-required" : ""}`}
                        onClick={(e) => handleUpvote(e, item.id)}
                        disabled={votingInProgress.includes(item.id)}
                        aria-label="Upvote"
                        title={isAuthenticated ? "Like" : "Log in to vote"}
                      >
                        <span>+</span>
                      </button>
                    </div>
                  </div>

                  {ratingMessages[item.id] && (
                    <div
                      className={`card-rating-message ${
                        ratingMessages[item.id].type
                      }`}
                    >
                      {ratingMessages[item.id].text}
                    </div>
                  )}

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
