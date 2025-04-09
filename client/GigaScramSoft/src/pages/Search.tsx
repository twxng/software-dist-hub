import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { contentService } from "../services/contentService";
import { ContentUnit, ContentUnitSubCategoryModel } from "../types/content";
import { formatImageUrl } from "../utils/imageUtils";
import ReactStars from "react-rating-stars-component";
import "../styles/components/Home.css";
import "../styles/components/Search.css";

const Search = () => {
  const [contentItems, setContentItems] = useState<ContentUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedItemIds, setLoadedItemIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        await contentService.getCategories();
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q") || "";
    const category = params.get("category")
      ? parseInt(params.get("category") || "0", 10)
      : 0;
    const page = params.get("page")
      ? parseInt(params.get("page") || "1", 10)
      : 1;

    setSearchQuery(query);
    setSelectedCategory(category);
    setCurrentPage(page);
  }, [location.search]);

  useEffect(() => {
    if (!searchQuery.trim() && selectedCategory <= 0) {
      setContentItems([]);
      setIsLoading(false);
      return;
    }

    const performSearch = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(
          `Performing search for: "${searchQuery}", category: ${selectedCategory}, page: ${currentPage}`
        );

        const response = await contentService.searchContentByName(
          searchQuery,
          currentPage,
          selectedCategory > 0 ? selectedCategory : 0
        );

        console.log("Search response:", response);

        if (response.statusCode === 200 && response.data) {
          setContentItems(response.data.contentUnits || []);
          setTotalPages(response.data.totalNumberOfPages || 0);

          const itemsPerPage = 10;
          const displayedItems = response.data.contentUnits?.length || 0;
          const calculatedTotal = response.data.isTheLastPage
            ? (response.data.pageNumber - 1) * itemsPerPage + displayedItems
            : response.data.totalNumberOfPages * itemsPerPage;

          setTotalResults(calculatedTotal);
          setError(null);
        } else {
          setContentItems([]);
          setError(response.message || "An error occurred during search");
        }
      } catch (error) {
        console.error("Search error:", error);
        setContentItems([]);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [searchQuery, selectedCategory, currentPage]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 1) {
        setIsLoadingSuggestions(true);
        try {
          console.log(`Getting suggestions for: "${searchQuery}"`);
          const response = await contentService.getSuggestions(searchQuery);
          if (response.statusCode === 200 && response.data) {
            console.log(`Got ${response.data.length} suggestions`);
            setSuggestions(response.data);
            setShowSuggestions(true);
          } else {
            console.warn(`Failed to get suggestions: ${response.message}`);
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCardClick = (id: number) => {
    navigate(`/content/${id}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query || selectedCategory > 0) {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (selectedCategory > 0)
        params.append("category", selectedCategory.toString());
      params.append("page", "1");

      navigate(`/search?${params.toString()}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion.includes("/")) {
      const parts = suggestion.split("/").map((part) => part.trim());

      const findCategoryId = async () => {
        try {
          const response = await contentService.getCategories();
          if (response.statusCode === 200 && response.data) {
            const category = response.data.find(
              (cat) =>
                cat.mainCategory &&
                cat.mainCategory.name === parts[0] &&
                cat.name === parts[1]
            );

            if (category) {
              const params = new URLSearchParams();
              params.set("category", category.id.toString());
              params.set("page", "1");
              navigate(`/search?${params.toString()}`);
            } else {
              navigate(`/search?q=${encodeURIComponent(suggestion)}&page=1`);
            }
          }
        } catch (error) {
          console.error("Error finding category:", error);

          navigate(`/search?q=${encodeURIComponent(suggestion)}&page=1`);
        }
      };

      findCategoryId();
    } else {
      navigate(`/search?q=${encodeURIComponent(suggestion)}&page=1`);
    }

    setShowSuggestions(false);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    if (text.includes("/")) {
      const parts = text.split("/").map((part) => part.trim());

      if (parts[0].toLowerCase().includes(query.toLowerCase())) {
        const index = parts[0].toLowerCase().indexOf(query.toLowerCase());
        const beforeMatch = parts[0].substring(0, index);
        const match = parts[0].substring(index, index + query.length);
        const afterMatch = parts[0].substring(index + query.length);

        return (
          <span className="category">
            <span className="category-parent">
              {beforeMatch}
              <strong>{match}</strong>
              {afterMatch}
            </span>
            <span className="category-separator">/</span>
            <span>{parts[1]}</span>
          </span>
        );
      }

      if (parts[1].toLowerCase().includes(query.toLowerCase())) {
        const index = parts[1].toLowerCase().indexOf(query.toLowerCase());
        const beforeMatch = parts[1].substring(0, index);
        const match = parts[1].substring(index, index + query.length);
        const afterMatch = parts[1].substring(index + query.length);

        return (
          <span className="category">
            <span className="category-parent">{parts[0]}</span>
            <span className="category-separator">/</span>
            <span>
              {beforeMatch}
              <strong>{match}</strong>
              {afterMatch}
            </span>
          </span>
        );
      }

      return (
        <span className="category">
          <span className="category-parent">{parts[0]}</span>
          <span className="category-separator">/</span>
          <span>{parts[1]}</span>
        </span>
      );
    }

    const index = text.toLowerCase().indexOf(query.toLowerCase());

    if (index === 0) {
      const highlighted = (
        <>
          <strong>{text.substring(0, query.length)}</strong>
          {text.substring(query.length)}
        </>
      );
      return highlighted;
    } else if (index > 0) {
      const beforeMatch = text.substring(0, index);
      const match = text.substring(index, index + query.length);
      const afterMatch = text.substring(index + query.length);

      const highlighted = (
        <>
          {beforeMatch}
          <strong>{match}</strong>
          {afterMatch}
        </>
      );
      return highlighted;
    }

    return text;
  };

  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(location.search);
    params.set("page", pageNumber.toString());
    navigate(`/search?${params.toString()}`);
    window.scrollTo(0, 0);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          className="pagination-button"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="pagination-ellipsis">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-button ${currentPage === i ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="pagination-ellipsis">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          className="pagination-button"
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-arrow"
        >
          &laquo; Prev
        </button>

        <div className="pagination-pages">{pages}</div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-arrow"
        >
          Next &raquo;
        </button>
      </div>
    );
  };

  return (
    <div className="search-page-container">
      <div className="search-hero">
        <h1 className="search-title">Search Software</h1>
        <div className="search-box" ref={searchRef}>
          <form onSubmit={handleSearch}>
            <div
              className={`search-input-wrapper ${isFocused ? "focused" : ""}`}
            >
              <input
                type="text"
                className="search-page-input"
                placeholder="Search software..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setIsFocused(true);
                  if (searchQuery.trim().length >= 1) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => setIsFocused(false)}
              />
              {isLoadingSuggestions ? (
                <div className="search-page-loader"></div>
              ) : (
                <button
                  type="submit"
                  className="search-page-button"
                  aria-label="Search"
                >
                  <svg
                    className="search-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              )}

              {showSuggestions && suggestions.length > 0 && (
                <div className="search-page-suggestions">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="search-suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <svg
                        className="suggestion-icon"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {highlightMatch(suggestion, searchQuery)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="search-results-section">
        {selectedCategory > 0 && !searchQuery.trim() ? (
          <h1 className="search-results-heading">
            {isLoading
              ? "Searching in selected category..."
              : contentItems.length > 0
              ? `Found ${totalResults} result${
                  totalResults !== 1 ? "s" : ""
                } in selected category`
              : `No results found in selected category`}
          </h1>
        ) : searchQuery ? (
          <h1 className="search-results-heading">
            {isLoading
              ? "Searching..."
              : contentItems.length > 0
              ? `Found ${totalResults} result${
                  totalResults !== 1 ? "s" : ""
                } for "${searchQuery}"${
                  selectedCategory > 0 ? ` in selected category` : ""
                }`
              : `No results found for "${searchQuery}"${
                  selectedCategory > 0 ? ` in selected category` : ""
                }`}
          </h1>
        ) : (
          <h1 className="search-results-heading">Enter search query</h1>
        )}

        {isLoading ? (
          <div className="content-loading">
            <div className="loading-spinner"></div>
            <p>Searching for results...</p>
          </div>
        ) : error ? (
          <div className="content-error">
            <h3>Search Error</h3>
            <p>{error}</p>
            <p>
              Try changing your search parameters or select a different
              category.
            </p>
            <button
              className="retry-button"
              onClick={() => {
                const params = new URLSearchParams(location.search);
                const query = params.get("q") || "";
                const category = params.get("category")
                  ? parseInt(params.get("category") || "0", 10)
                  : 0;

                if (category > 0) {
                  navigate(`/search?q=${query}`);
                } else if (query) {
                  setError(null);
                  setIsLoading(true);
                  setTimeout(() => {
                    setSearchQuery(query);
                  }, 100);
                } else {
                  navigate("/");
                }
              }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="search-results-container">
            {contentItems.length === 0 &&
            (searchQuery.trim() || selectedCategory > 0) ? (
              <div className="no-results">
                <div className="no-results-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="no-results-title">No results found</h3>
                {searchQuery.trim() ? (
                  <p className="no-content">
                    No results found for "{searchQuery}"
                  </p>
                ) : selectedCategory > 0 ? (
                  <p className="no-content">
                    No results found in selected category
                  </p>
                ) : null}
                <div className="no-results-suggestions">
                  <h4>Suggestions:</h4>
                  <ul>
                    {searchQuery.trim() && <li>Check your spelling</li>}
                    {searchQuery.trim() && (
                      <li>Try using different keywords</li>
                    )}
                    {searchQuery.trim() && <li>Simplify your search query</li>}
                    {selectedCategory > 0 && <li>Search in all categories</li>}
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <div className="content-cards-container">
                  {contentItems.map((item) => (
                    <div
                      key={item.id}
                      className={`content-card ${
                        loadedItemIds.includes(item.id)
                          ? "content-card-appear"
                          : ""
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
                      <div className="content-card-body">
                        <h3 className="content-card-title">{item.header}</h3>
                        <div className="content-card-subtitle">
                          <span className="content-card-category">
                            {item.subCategory?.mainCategory?.name} /{" "}
                            {item.subCategory?.name}
                          </span>
                        </div>
                        <p className="content-card-text">
                          {item.shortDescription}
                        </p>
                        <div className="content-card-footer">
                          {/* <div className="content-card-rating">
                            <ReactStars
                              count={5}
                              value={item.rating || 0}
                              edit={false}
                              size={18}
                              isHalf={true}
                              activeColor="#ffd700"
                            />
                            <span className="rating-value">
                              {item.rating?.toFixed(1) || "0.0"}
                            </span>
                          </div> */}
                          <button className="content-card-button">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {renderPagination()}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
