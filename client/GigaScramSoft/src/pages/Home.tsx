import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { contentService } from "../services/contentService";
import { ContentUnit } from "../types/content";
import { formatImageUrl } from "../utils/imageUtils";
import ReactStars from "react-rating-stars-component";
import { useAuthStore } from "../store/authStore";
import "../styles/components/Home.css";
import HeroSlider from "../components/HeroSlider";

const Home = () => {
  const [contentItems, setContentItems] = useState<ContentUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedItemIds, setLoadedItemIds] = useState<number[]>([]);
  const [votingInProgress, setVotingInProgress] = useState<number[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
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

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleNextSlide = () => {
    const maxSlides = Math.ceil(contentItems.length / 3) - 1;
    setCurrentSlide((prev) => Math.min(maxSlides, prev + 1));
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="home-container">
      <HeroSlider />
      <section className="promo-section">
        <h2>Promotions and special offers</h2>
        <div className="promo-cards">
          <div className="promo-card">
            <img
              src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80"
              alt="Знижка"
            />
            <div>
              <h3>Discount -10% on top programs!</h3>
              <p>
                Hurry up and take advantage of the great offer until the end of
                the month.
              </p>
            </div>
          </div>
          <div className="promo-card">
            <img
              src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80"
              alt="Новинки"
            />
            <div>
              <h3>Catalogue novelties</h3>
              <p>
                We add the most advanced software for your needs every week!
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="categories-section">
        <h2>Program categories</h2>
        <div className="categories-cards">
          <div className="category-card-item">
            <img
              src="https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8b3BlcmF0aW5nJTIwc3lzdGVtfGVufDB8fDB8fHww"
              alt="Офісне ПЗ"
            />
            <Link
              to="/categories#Operating%20Systems"
              className="categories-link"
            >
              Operating Systems
            </Link>
          </div>
          <div className="category-card-item">
            <img
              src="https://i.pinimg.com/736x/25/18/11/251811f54bdb444d134cfc9a8d34a642.jpg"
              alt="Безпека"
            />
            <Link
              to="/categories#Development%20&%20Programming"
              className="categories-link"
            >
              <span>Multimedia & Design</span>
            </Link>
          </div>
          <div className="category-card-item">
            <img
              src="https://images.unsplash.com/photo-1649433391420-542fcd3835ea?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29yZCUyMG1pY3Jvc29mdHxlbnwwfHwwfHx8MA%3D%3D"
              alt="Productivity & Office Tools"
            />
            <Link
              to="/categories#Productivity%20&%20Office%20Tools"
              className="categories-link"
            >
              Productivity & Office Tools
            </Link>
          </div>
          <div className="category-card-item">
            <img
              src="https://images.unsplash.com/photo-1596526131115-f9f0aa669493?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGJyb3dzZXJ8ZW58MHx8MHx8fDA%3D"
              alt="Development & Programming"
            />
            <Link
              to="/categories#Networking%20&%20Internet"
              className="categories-link"
            >
              Networking & Internet
            </Link>
          </div>
					          <div className="category-card-item">
            <img
              src="https://images.unsplash.com/photo-1649180564403-db28d5673f48?q=80&w=2062&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Development & Programming"
            />
            <Link
              to="/categories#Development%20&%20Programming"
              className="categories-link"
            >
             Development & Programming
            </Link>
          </div>
        </div>
      </section>
      <section className="popular-section">
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
          <>
            <div className="top-rated-section">
              <h3>Top Rated Apps</h3>
              <div className="top-rated-cards">
                {contentItems
                  .sort((a, b) => (b.score || 0) - (a.score || 0))
                  .slice(0, 4)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="top-rated-card"
                      onClick={() => handleCardClick(item.id)}
                    >
                      <div className="top-rated-image">
                        <img
                          src={formatImageUrl(item.previewImage)}
                          alt={item.header}
                        />
                        <div className="top-rated-badge">
                          <span>★</span>
                          <span>{item.score || 0}</span>
                        </div>
                      </div>
                      <div className="top-rated-info">
                        <h4>{item.header}</h4>
                        <p>{item.shortDescription}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="slider">
							<h2>Users also choose to</h2>
							<div className="content-cards-container">
              <div 
                ref={sliderRef}
                className="content-cards-slider"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {contentItems.map((item) => (
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
                      <button className="view-more-button" aria-label="Докладніше">
                        View more
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M13 18l6-6-6-6"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="slider-controls">
                <button
                  className="slider-button"
                  onClick={handlePrevSlide}
                  disabled={currentSlide === 0}
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <div className="slider-dots">
                  {Array.from({ length: Math.ceil(contentItems.length / 3) }).map((_, index) => (
                    <div
                      key={index}
                      className={`slider-dot ${currentSlide === index ? 'active' : ''}`}
                      onClick={() => handleDotClick(index)}
                    />
                  ))}
                </div>
                <button
                  className="slider-button"
                  onClick={handleNextSlide}
                  disabled={currentSlide >= Math.ceil(contentItems.length / 3) - 1}
                >
                  Next
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
						</div>
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
