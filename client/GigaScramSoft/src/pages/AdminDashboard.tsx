import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ContentForm from "../components/ContentForm";
import EditContentForm from "../components/EditContentForm";
import SelectContentForm from "../components/SelectContentForm";

import { contentService } from "../services/contentService";
import { ContentUnit, ContentUnitSubCategoryModel } from "../types/content";
import "../styles/components/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showContentForm, setShowContentForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSelectForm, setShowSelectForm] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<number | null>(
    null
  );
  const [selectedContent, setSelectedContent] = useState<ContentUnit | null>(
    null
  );
  const [showContentManagement, setShowContentManagement] = useState(false);
  const [contentItems, setContentItems] = useState<ContentUnit[]>([]);
  const [categories, setCategories] = useState<ContentUnitSubCategoryModel[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showContentManagement) {
      loadContent();
      loadCategories();
    }
  }, [showContentManagement]);

  const loadCategories = async () => {
    try {
      const response = await contentService.getCategories();
      if (response.data) {
        setCategories(response.data);
        console.log("Loaded categories:", response.data);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const getCategoryName = (subCategoryId: number) => {
    const subCategory = categories.find((cat) => cat.id === subCategoryId);
    if (!subCategory) return { main: "Unknown", sub: "Unknown" };

    return {
      main: subCategory.mainCategory?.name || "Unknown",
      sub: subCategory.name || "Unknown",
    };
  };

  const loadContent = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const addContentItem = (item: ContentUnit) => {
        setContentItems((prevItems) => {
          if (prevItems.some((existingItem) => existingItem.id === item.id)) {
            return prevItems;
          }

          return [...prevItems, item].sort((a, b) => a.id - b.id);
        });

        setIsLoading(false);
      };

      const response = await contentService.getAllContent(addContentItem);

      if (response.statusCode === 200) {
        console.log(
          "Receiving content for the admin panel is complete:",
          response.message
        );
        setIsLoading(false);
      } else {
        console.error("Could not get the content:", response.message);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Content loading error:", err);
      setIsLoading(false);
    }
  };

  const handleAddContent = async (newContent: ContentUnit) => {
    console.log("New content added:", newContent);
    await loadContent();
  };

  const handleEditSoftware = () => {
    setShowSelectForm(true);
  };

  const handleSelectContent = (contentId: number) => {
    setSelectedContentId(contentId);
    setShowSelectForm(false);
    setShowEditForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      try {
        const response = await contentService.deleteContent(id);
        if (response.statusCode === 200) {
          console.log(`Content with ID ${id} deleted successfully`);
          await loadContent();
        } else {
          console.error("Failed to delete content:", response.message);
        }
      } catch (err) {
        console.error("Error deleting content:", err);
      }
    }
  };

  const handleViewDetails = (id: number) => {
    navigate(`/content/${id}`);
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>User Management</h3>
            <div className="card-content">
              <p>
                Total users: <span className="highlight">4</span>
              </p>
              <button className="dashboard-button primary">Manage Users</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Software Management</h3>
            <div className="card-content">
              <p>
                Total applications:{" "}
                <span className="highlight">{contentItems.length}</span>
              </p>
              <div className="button-group">
                <button
                  className="dashboard-button success"
                  onClick={() => setShowContentForm(true)}
                >
                  Add Software
                </button>
                <button
                  className="dashboard-button"
                  onClick={handleEditSoftware}
                >
                  Edit Software
                </button>
                <button className="dashboard-button danger">
                  Delete Software
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Analytics</h3>
            <div className="card-content">
              <p>
                Total downloads: <span className="highlight">0</span>
              </p>
              <button className="dashboard-button info">
                Detailed Statistics
              </button>
            </div>
          </div>

          <div className="dashboard-card content-management-card">
            <h3
              className="collapsible-header"
              onClick={() => setShowContentManagement(!showContentManagement)}
            >
              Content Unit Management
              <span className="collapse-icon">
                {showContentManagement ? "▼" : "►"}
              </span>
            </h3>

            {showContentManagement && (
              <div className="card-content">
                {isLoading && contentItems.length === 0 ? (
                  <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading</p>
                  </div>
                ) : (
                  <>
                    <table className="content-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Subcategory</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contentItems.map((item) => {
                          const categoryInfo = getCategoryName(
                            item.subCategoryId
                          );
                          return (
                            <tr
                              key={item.id}
                              className="content-row"
                              onClick={() => handleViewDetails(item.id)}
                            >
                              <td>{item.id}</td>
                              <td>{item.header}</td>
                              <td>{categoryInfo.main}</td>
                              <td>{categoryInfo.sub}</td>
                              <td
                                className="actions"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="edit-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectContent(item.id);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="delete-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item.id);
                                  }}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {contentItems.length === 0 && (
                      <p className="no-content">No content items found</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showContentForm && (
        <ContentForm
          onSubmit={handleAddContent}
          onClose={() => {
            setShowContentForm(false);
            setSelectedContent(null);
          }}
          initialData={selectedContent || undefined}
        />
      )}

      {showSelectForm && (
        <SelectContentForm
          onSelect={handleSelectContent}
          onClose={() => setShowSelectForm(false)}
        />
      )}

      {showEditForm && selectedContentId && (
        <EditContentForm
          contentId={selectedContentId}
          onSuccess={() => {
            loadContent();
          }}
          onClose={() => {
            setShowEditForm(false);
            setSelectedContentId(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
