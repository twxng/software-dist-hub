import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { commentService } from '../services/commentService';
// import { userService } from '../services/userService';
import { ContentUnit, ContentUnitSubCategoryModel } from '../types/content';
import { Comment } from '../types/comments';
import { useAuthStore } from '../store/authStore';
import '../styles/pages/ContentDetails.css';
import AuthModal from '../components/AuthModal';

const ContentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuthStore();
  const [content, setContent] = useState<ContentUnit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [categories, setCategories] = useState<ContentUnitSubCategoryModel[]>([]);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentPage, setCommentPage] = useState(1);
  const [totalCommentPages, setTotalCommentPages] = useState(1);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [totalComments, setTotalComments] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const loadContent = async () => {
      if (!id) {
        setError('Content ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const contentId = parseInt(id, 10);
        const response = await contentService.getContentById(contentId);
        
        if (response.statusCode === 200 && response.data) {
          console.log('Content details loaded:', response.data);
          setContent(response.data);
                    await loadCategories();
                    await loadComments(contentId);
                    await loadCommentPagesCount(contentId);
        } else {
          setError(response.message || 'Failed to load content');
        }
      } catch (err) {
        console.error('Error loading content details:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [id]);

  const loadComments = async (contentId: number, page: number = 1) => {
    try {
      setIsLoadingComments(true);
      setCommentError(null);
      const response = await commentService.getComments(contentId, page);
      
      if (response.statusCode === 200 && response.data) {
        console.log('Retrieved comments:', response.data);
        
        let commentsArray: Comment[] = [];
        if (response.data.comments && Array.isArray(response.data.comments)) {
          commentsArray = response.data.comments;
          if (response.data.totalComments !== undefined) {
            setTotalComments(response.data.totalComments);
          }
        } else if (Array.isArray(response.data)) {
          commentsArray = response.data;
        } else {
          console.log('Response structure:', response.data);
          const foundArray = Object.values(response.data).find(value => Array.isArray(value));
          if (foundArray) {
            commentsArray = foundArray as Comment[];
          } else {
            console.error('Could not find comments array in response:', response.data);
            commentsArray = [];
          }
        }
        
        const processedComments = commentsArray.map(comment => {
          if (comment.user && comment.user.login) {
            return {
              ...comment,
              userName: comment.user.login
            };
          }
          
          if (!comment.userName && comment.userId) {
            return {
              ...comment,
              userName: `User ${comment.userId}`
            };
          }
          
          return comment;
        });
        
        setComments(processedComments);
        if (response.data.pageNumber !== undefined) {
          setCommentPage(response.data.pageNumber);
        }
        if (response.data.totalNumberOfPages !== undefined) {
          setTotalCommentPages(response.data.totalNumberOfPages);
          
          if (response.data.totalComments === undefined) {
            const commentsPerPage = 10;
            const lastPageComments = page === response.data.totalNumberOfPages ? commentsArray.length : commentsPerPage;
            const totalEstimatedComments = (response.data.totalNumberOfPages - 1) * commentsPerPage + lastPageComments;
            setTotalComments(totalEstimatedComments);
          }
        }
      } else if (response.statusCode === 401) {
        console.warn('Authorization required to load comments');
        setComments([]);
        setCommentError('Please log in to view comments');
      } else {
        setComments([]);
        setCommentError(response.message || 'Failed to load comments');
      }
    } catch (err) {
      console.error('Error loading comments:', err);
      if (err instanceof Error && err.message === 'Server Side Error') {
        setComments([]);
        setCommentError(null);
      } else {
        setComments([]);
        setCommentError(err instanceof Error ? err.message : 'Failed to load comments');
      }
    } finally {
      setIsLoadingComments(false);
    }
  };

  const loadCommentPagesCount = async (contentId: number) => {
    try {
      const response = await commentService.getCountOfPagesWithComments(contentId);
      
      if (response.statusCode === 200 && response.data) {
        setTotalCommentPages(response.data);
      }
    } catch (err) {
      console.error('Error loading comment pages count:', err);
      if (err instanceof Error && err.message === 'Server Side Error') {
        setTotalCommentPages(1);
      }
    }
  };
  const loadCategories = async () => {
    try {
      const response = await contentService.getCategories();
      if (response.data) {
        setCategories(response.data);
        console.log('Loaded categories:', response.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const getCategoryName = (subCategoryId: number) => {
    const subCategory = categories.find(cat => cat.id === subCategoryId);
    if (!subCategory) return { main: 'Unknown', sub: 'Unknown' };
    
    return {
      main: subCategory.mainCategory?.name || 'Unknown',
      sub: subCategory.name || 'Unknown'
    };
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const handleAddComment = async () => {
    if (!id || !newComment.trim()) return;
    
    if (!isAuthenticated) {
      alert('Please log in to add a comment');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication required to add comments');
      return;
    }
    
    try {
      const contentId = parseInt(id, 10);
      console.log('Adding comment:', {
        contentId: contentId,
        text: newComment
      });
      
      const response = await commentService.createComment({
        contentId,
        text: newComment
      });
      
      console.log('Comment creation response:', response);
      
      if (response.statusCode === 200) {
        setNewComment('');
        await loadComments(contentId, 1);
        await loadCommentPagesCount(contentId);
      } else {
        setCommentError(response.message || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setCommentError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!id || userRole !== 'Admin') return;
    
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const contentId = parseInt(id, 10);
        const response = await commentService.removeComment(commentId);
        
        if (response.statusCode === 200) {
          await loadComments(contentId, commentPage);
          await loadCommentPagesCount(contentId);
        } else {
          setCommentError(response.message || 'Failed to delete comment');
        }
      } catch (err) {
        console.error('Error deleting comment:', err);
        setCommentError(err instanceof Error ? err.message : 'Failed to delete comment');
      }
    }
  };

  const handleCommentPageChange = async (page: number) => {
    if (!id) return;
    
    const contentId = parseInt(id, 10);
    await loadComments(contentId, page);
  };

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  if (isLoading) {
    return <div className="content-details-loading">Loading content details...</div>;
  }

  if (error) {
    return (
      <div className="content-details-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleGoBack} className="back-button">Go Back</button>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="content-details-not-found">
        <h2>Content Not Found</h2>
        <p>The requested content could not be found.</p>
        <button onClick={handleGoBack} className="back-button">Go Back</button>
      </div>
    );
  }

  return (
    <div className="content-details-container">
      <div className="content-details-header">
        <button onClick={handleGoBack} className="back-button">
          &larr; Back
        </button>
        <h1 className="content-title">{content.header}</h1>
      </div>

      <div className="content-details-grid">
				 {/* <h1 className="content-title">{content.header}</h1> */}
        <div className="content-details-main-image">
          <img src={content.previewImage} alt={content.header} />
					      {content.images && content.images.length > 0 && (
        <div className="content-details-section">
          <h2>Images Gallery</h2>
          <div className="content-details-thumbnails">
            {content.images.map((image, index) => (
              <div 
                key={image.id} 
                className="thumbnail"
                onClick={() => handleImageClick(index)}
              >
                <img src={image.value} alt={`${content.header} - image ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}
        </div>

        <div className="content-details-info">
					 {/* <h1 className="content-title">{content.header}</h1> */}
          <div className="content-details-section">
            <h2>Short Description</h2>
            <p className="content-short-description">{content.shortDescription}</p>
          </div>

          <div className="content-details-section">
            <h2>Full Description</h2>
            <div className="content-full-description" dangerouslySetInnerHTML={{ __html: content.fullDescription }} />
          </div>

          <div className="content-details-section">
            <h2>Category</h2>
            <p>
              {content && content.subCategoryId ? 
                `${getCategoryName(content.subCategoryId).main} / ${getCategoryName(content.subCategoryId).sub}` : 
                'Unknown / Unknown'}
            </p>
          </div>

          <div className="content-details-section">
            <h2>Download</h2>
            <a 
              href={content.downloadLink} 
              className="download-button" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Download Software
            </a>
          </div>
        </div>
      </div>

      <div className="content-comments-section">
        <h2>Comments</h2>
        
        {isAuthenticated ? (
          <div className="comment-form">
            <textarea
              placeholder="Write your comment here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="comment-input"
            />
            <button 
              onClick={handleAddComment}
              className="comment-submit-button"
              disabled={!newComment.trim()}
            >
              Post Comment
            </button>
          </div>
        ) : (
          <div className="comment-login-prompt">
            <p>Please <a onClick={openLoginModal} className="login-link">log in</a> to leave a comment.</p>
          </div>
        )}
        
        <div className="comments-container">
          {isLoadingComments ? (
            <div className="comments-loading">Loading comments...</div>
          ) : commentError ? (
            <div className="comments-error">{commentError}</div>
          ) : comments.length === 0 ? (
            <div className="no-comments">No comments yet. Be the first to comment!</div>
          ) : (
            <>
              <div className="comments-info">
                Total comments: {totalComments}
              </div>
              
              {comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-author-avatar">
                      {(comment.userName || (comment.user && comment.user.login) || `U${comment.userId}`).charAt(0).toUpperCase()}
                    </div>
                    <span className="comment-author">
                      {comment.userName || (comment.user && comment.user.login) || `User ${comment.userId}` || 'Anonymous'}
                    </span>
                    <span className="comment-date">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <div className="comment-text">{comment.text || comment.value || 'Empty comment'}</div>
                  {userRole === 'Admin' && (
                    <button 
                      className="comment-delete-button"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
              
              {totalCommentPages > 1 && (
                <div className="comments-pagination">
                  <button 
                    onClick={() => handleCommentPageChange(commentPage - 1)}
                    disabled={commentPage === 1}
                    className="pagination-button prev"
                  >
                    Previous
                  </button>
                  
                  <span className="pagination-info">
                    Page {commentPage} of {totalCommentPages}
                  </span>
                  
                  <button 
                    onClick={() => handleCommentPageChange(commentPage + 1)}
                    disabled={commentPage === totalCommentPages}
                    className="pagination-button next"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showImageModal && selectedImageIndex >= 0 && content.images && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeImageModal}>×</button>
            <img 
              src={content.images[selectedImageIndex].value} 
              alt={`${content.header} - image ${selectedImageIndex + 1}`} 
            />
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default ContentDetails; 