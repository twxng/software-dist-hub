import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { contentService } from "../services/contentService";
import { ContentUnit, SubCategory } from "../types/content";
import { formatImageUrl } from "../utils/imageUtils";
import ReactStars from "react-rating-stars-component";
import "../styles/components/Home.css";
import "../styles/components/Category.css";

const Category = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [contentItems, setContentItems] = useState<ContentUnit[]>([]);
  const [category, setCategory] = useState<SubCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedItemIds, setLoadedItemIds] = useState<number[]>([]);
  const [votingInProgress, setVotingInProgress] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategoryContent = async () => {
      if (!categoryId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get all categories to find info about current one
        const categoriesResponse = await contentService.getCategories();
        
        if (categoriesResponse.statusCode === 200 && categoriesResponse.data) {
          // Find current subcategory
          const currentCategory = categoriesResponse.data.find(
            cat => cat.id === parseInt(categoryId)
          );
          
          if (currentCategory) {
            setCategory(currentCategory);
          } else {
            setError("Category not found");
            setIsLoading(false);
            return;
          }
        }
        
        // Get all content
        const allContent = await contentService.getAllContent();
        
        if (allContent.statusCode === 200 && allContent.data) {
          // Filter content by subcategory
          const categoryContent = allContent.data.filter(
            item => item.subCategoryId === parseInt(categoryId)
          );
          
          setContentItems(categoryContent);
          
          // Add all IDs to loaded for animation
          setLoadedItemIds(categoryContent.map(item => item.id));
          
          // Get current rating for each content item
          categoryContent.forEach(async (item) => {
            try {
              console.log(`Fetching score for category content ${item.id}...`);
              const scoreResponse = await contentService.getContentScore(item.id);
              
              if (scoreResponse.statusCode === 200) {
                console.log(`Got score for category content ${item.id}: ${scoreResponse.data}`);
                setContentItems(prevItems => 
                  prevItems.map(prevItem => 
                    prevItem.id === item.id ? { ...prevItem, score: scoreResponse.data } : prevItem
                  )
                );
              } else {
                console.warn(`Failed to get score for category content ${item.id}`);
              }
            } catch (error) {
              console.error(`Error getting score for category content ${item.id}:`, error);
            }
          });
        } else {
          setError(allContent.message || "Failed to load category programs");
        }
      } catch (err) {
        console.error(`Error loading category ${categoryId}:`, err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryContent();
  }, [categoryId]);

  const handleCardClick = (id: number) => {
    navigate(`/content/${id}`);
  };

  const handleUpvote = async (event: React.MouseEvent, contentId: number) => {
    event.stopPropagation();
    if (votingInProgress.includes(contentId)) return;
    
    try {
      setVotingInProgress(prev => [...prev, contentId]);
      const response = await contentService.upvoteContent(contentId);
      
      if (response.statusCode === 200) {
        // Get current rating from the server
        const scoreResponse = await contentService.getContentScore(contentId);
        
        if (scoreResponse.statusCode === 200) {
          // Update with the current rating
          setContentItems(prevItems => 
            prevItems.map(item => 
              item.id === contentId ? { ...item, score: scoreResponse.data } : item
            )
          );
        } else {
          // If we couldn't get the current rating, just increment
          setContentItems(prevItems => 
            prevItems.map(item => 
              item.id === contentId ? { ...item, score: item.score + 1 } : item
            )
          );
        }
      } else {
        console.error("Error upvoting content:", response.message);
      }
    } catch (error) {
      console.error("Error upvoting:", error);
    } finally {
      setVotingInProgress(prev => prev.filter(id => id !== contentId));
    }
  };
  
  const handleDownvote = async (event: React.MouseEvent, contentId: number) => {
    event.stopPropagation();
    if (votingInProgress.includes(contentId)) return;
    
    try {
      setVotingInProgress(prev => [...prev, contentId]);
      const response = await contentService.downvoteContent(contentId);
      
      if (response.statusCode === 200) {
        // Get current rating from the server
        const scoreResponse = await contentService.getContentScore(contentId);
        
        if (scoreResponse.statusCode === 200) {
          // Update with the current rating
          setContentItems(prevItems => 
            prevItems.map(item => 
              item.id === contentId ? { ...item, score: scoreResponse.data } : item
            )
          );
        } else {
          // If we couldn't get the current rating, just decrement
          setContentItems(prevItems => 
            prevItems.map(item => 
              item.id === contentId ? { ...item, score: item.score - 1 } : item
            )
          );
        }
      } else {
        console.error("Error downvoting content:", response.message);
      }
    } catch (error) {
      console.error("Error downvoting:", error);
    } finally {
      setVotingInProgress(prev => prev.filter(id => id !== contentId));
    }
  };

  return (
    <div className="category-container">
      <div className="category-hero">
        {category ? (
          <>
            <div className="category-breadcrumbs">
              <span onClick={() => navigate("/")} className="breadcrumb-item">Home</span>
              <span className="breadcrumb-separator">/</span>
              <span onClick={() => navigate("/categories")} className="breadcrumb-item">Categories</span>
              <span className="breadcrumb-separator">/</span>
              <span onClick={() => navigate(`/categories#${category.mainCategory.name}`)} className="breadcrumb-item">{category.mainCategory.name}</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item current">{category.name}</span>
            </div>
            <h1 className="category-title">{category.name}</h1>
            <p className="category-description">
              Programs in the category {category.mainCategory.name} - {category.name}
            </p>
          </>
        ) : !isLoading ? (
          <h1 className="category-title">Category not found</h1>
        ) : null}
      </div>

      {isLoading ? (
        <div className="content-loading">
          <div className="loading-spinner"></div>
          <p>Loading programs...</p>
        </div>
      ) : error ? (
        <div className="content-error">
          <p>{error}</p>
        </div>
      ) : (
        <div className="content-cards-container">
          {contentItems.length === 0 ? (
            <p className="no-content">No programs in this category</p>
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
                        className={`rating-button downvote ${votingInProgress.includes(item.id) ? 'disabled' : ''}`}
                        onClick={(e) => handleDownvote(e, item.id)}
                        disabled={votingInProgress.includes(item.id)}
                        aria-label="Downvote"
                      >
                        <span>-</span>
                      </button>
                      <button 
                        className={`rating-button upvote ${votingInProgress.includes(item.id) ? 'disabled' : ''}`}
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

export default Category; 