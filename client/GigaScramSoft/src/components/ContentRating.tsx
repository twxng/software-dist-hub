import React from "react";
import ReactStars from "react-rating-stars-component";
import "../styles/components/ContentRating.css";

interface ContentRatingProps {
  score: number;
  isAuthenticated: boolean;
  isRatingInProgress: boolean;
  onUpvote: () => void;
  onDownvote: () => void;
  onLoginClick: () => void;
  ratingMessage: { type: "success" | "error"; text: string } | null;
}

const ContentRating: React.FC<ContentRatingProps> = ({
  score,
  isAuthenticated,
  isRatingInProgress,
  onUpvote,
  onDownvote,
  onLoginClick,
  ratingMessage,
}) => {
  return (
    <div className="content-rating">
      {/* <h3 className="rating-title">Rating</h3> */}
      <div className="rating-container">
        <div className="rating-column">
          <button
            className={`vote-button up ${
              isRatingInProgress ? "disabled" : ""
            } ${!isAuthenticated ? "auth-required" : ""}`}
            onClick={onUpvote}
            disabled={isRatingInProgress}
            aria-label="Upvote"
            title={isAuthenticated ? "Upvote" : "Login to vote"}
          >
            ▲
          </button>
          <div className="rating-score-display">
            <div className="rating-score">{score}</div>
          </div>
          <button
            className={`vote-button down ${
              isRatingInProgress ? "disabled" : ""
            } ${!isAuthenticated ? "auth-required" : ""}`}
            onClick={onDownvote}
            disabled={isRatingInProgress}
            aria-label="Downvote"
            title={isAuthenticated ? "Downvote" : "Login to vote"}
          >
            ▼
          </button>
        </div>

        <div className="rating-stars-container">
          <ReactStars
            count={5}
            value={Math.min(Math.max(score / 2, 0), 5)}
            size={36}
            edit={false}
            isHalf={true}
            activeColor="#ffd700"
          />
        </div>

        {ratingMessage && (
          <div className={`rating-message ${ratingMessage.type}`}>
            {ratingMessage.text}
          </div>
        )}

        {!isAuthenticated && (
          <div className="rating-auth-prompt">
            <p>
              To vote,{" "}
              <a onClick={onLoginClick} className="login-link">
                log in to your account
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentRating;
