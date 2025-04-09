import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { getUserDownloads } from "../services/userService";
import { useNavigate } from "react-router-dom";
import { ContentItem } from "../types/content";
import { UpdateProfileRequest } from "../types/api.types";
import ReactStars from "react-rating-stars-component";
import "../styles/pages/UserProfile.css";

const UserProfile = () => {
  const {
    user,
    userRole,
    isAuthenticated,
    updateUserProfile,
    uploadAvatar,
    changePassword,
    deleteAccount,
    logout,
  } = useAuthStore();
  const navigate = useNavigate();

  const [downloads, setDownloads] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [loginValue, setLoginValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    if (user) {
      setLoginValue(user.login || "");
      setEmailValue(user.email || "");
    }

    const loadDownloads = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await getUserDownloads(user.id);
        setDownloads(data);
      } catch (error) {
        console.error("Error loading downloads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDownloads();
  }, [isAuthenticated, user, navigate]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAvatarButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage("error", "Please select an image file (JPEG, PNG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("error", "Image size should be less than 5MB");
      return;
    }

    setIsLoading(true);
    try {
      const success = await uploadAvatar(file);
      if (success) {
        showMessage("success", "Avatar uploaded successfully");
      } else {
        showMessage("error", "Failed to upload avatar");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      showMessage("error", "Error uploading avatar");
    } finally {
      setIsLoading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!loginValue.trim()) {
      showMessage("error", "Username cannot be empty");
      return;
    }

    if (emailValue && !/\S+@\S+\.\S+/.test(emailValue)) {
      showMessage("error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const data: UpdateProfileRequest = {
        login: loginValue,
        email: emailValue,
      };

      const success = await updateUserProfile(data);
      if (success) {
        showMessage("success", "Profile updated successfully");
        setIsEditing(false);
      } else {
        showMessage("error", "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showMessage("error", "Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage("error", "All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      showMessage("error", "New password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const success = await changePassword(currentPassword, newPassword);
      if (success) {
        showMessage("success", "Password changed successfully");

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showMessage("error", "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showMessage("error", "Error changing password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmInput !== "DELETE") {
      showMessage("error", "Type DELETE to confirm account deletion");
      return;
    }

    setIsLoading(true);
    try {
      const success = await deleteAccount();
      if (success) {
        showMessage("success", "Account deleted. Redirecting to home page...");

        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        showMessage("error", "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      showMessage("error", "Error deleting account");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmInput("");
    }
  };

  const renderAvatar = () => {
    const isAdmin = userRole === "Admin";

    if (user?.avatar) {
      return (
        <div className={`profile-avatar ${isAdmin ? "admin" : ""}`}>
          <img src={user.avatar} alt="User avatar" />
        </div>
      );
    }

    const bgColor = isAdmin ? "#E74C3C" : "#3498DB";
    const letter = user?.login ? user.login.charAt(0).toUpperCase() : "?";

    return (
      <div
        className={`profile-avatar ${isAdmin ? "admin" : ""}`}
        style={{ backgroundColor: bgColor }}
      >
        {letter}
      </div>
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="profile-not-logged-in">
        <h2>Please log in to view your profile</h2>
        <button className="primary-button" onClick={() => navigate("/")}>
          Go to Home Page
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        {message && (
          <div className={`profile-message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          {renderAvatar()}

          <div className="profile-user-info">
            <h2>{user.login}</h2>
            <p className="profile-role">{userRole}</p>
          </div>

          <div className="profile-tabs">
            <button
              className={`profile-tab ${
                activeTab === "profile" ? "active" : ""
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Profile Settings
            </button>
            <button
              className={`profile-tab ${
                activeTab === "password" ? "active" : ""
              }`}
              onClick={() => setActiveTab("password")}
            >
              Change Password
            </button>
            <button
              className={`profile-tab ${
                activeTab === "downloads" ? "active" : ""
              }`}
              onClick={() => setActiveTab("downloads")}
            >
              Downloads
            </button>
            <button
              className={`profile-tab ${
                activeTab === "delete" ? "active" : ""
              }`}
              onClick={() => setActiveTab("delete")}
            >
              Delete Account
            </button>
          </div>
        </div>

        <div className="profile-main">
          {activeTab === "profile" && (
            <div className="profile-section">
              <h2>Profile Settings</h2>

              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-group">
                  <label htmlFor="profile-avatar">Profile Picture</label>
                  <div className="profile-avatar-upload">
                    {renderAvatar()}
                    <button
                      type="button"
                      className="avatar-upload-button"
                      onClick={handleAvatarButtonClick}
                      disabled={isLoading}
                    >
                      {isLoading ? "Uploading..." : "Upload Image"}
                    </button>
                    <input
                      type="file"
                      id="profile-avatar"
                      ref={fileInputRef}
                      className="hidden-file-input"
                      accept="image/jpeg, image/png, image/gif"
                      onChange={handleFileChange}
                    />
                    <p className="form-help-text">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="profile-username">Username</label>
                  <input
                    type="text"
                    id="profile-username"
                    value={loginValue}
                    onChange={(e) => setLoginValue(e.target.value)}
                    disabled={!isEditing || isLoading}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="profile-email">Email</label>
                  <input
                    type="email"
                    id="profile-email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    disabled={!isEditing || isLoading}
                    className="form-input"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Account Type</label>
                  <div className="form-static-value">{userRole || "User"}</div>
                </div>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Saving..."
                    : isEditing
                    ? "Save Changes"
                    : "Edit Profile"}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setIsEditing(false);

                      setLoginValue(user.login || "");
                      setEmailValue(user.email || "");
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>
          )}

          {activeTab === "password" && (
            <div className="profile-section">
              <h2>Change Password</h2>

              <form onSubmit={handleChangePassword} className="profile-form">
                <div className="form-group">
                  <label htmlFor="current-password">Current Password</label>
                  <input
                    type="password"
                    id="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isLoading}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    className="form-input"
                  />
                  <p className="form-help-text">
                    Password must be at least 6 characters long.
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Changing..." : "Change Password"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "downloads" && (
            <div className="profile-section">
              <h2>Download History</h2>

              {isLoading ? (
                <div className="profile-loading">
                  Loading download history...
                </div>
              ) : downloads.length === 0 ? (
                <div className="profile-empty-state">
                  <p>You haven't downloaded any software yet.</p>
                  <button
                    className="primary-button"
                    onClick={() => navigate("/")}
                  >
                    Browse Software
                  </button>
                </div>
              ) : (
                <div className="download-history">
                  {downloads.map((item) => (
                    <div key={item.id} className="download-item">
                      <div className="download-item-header">
                        <h3>{item.title}</h3>
                        <span className="download-date">
                          Downloaded:{" "}
                          {new Date(
                            item.downloadedAt || Date.now()
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="download-item-info">
                        <div className="download-item-icon">
                          {item.icon ? (
                            <img src={item.icon} alt={`${item.title} icon`} />
                          ) : (
                            <div className="default-download-icon">
                              {item.title.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="download-item-details">
                          <p className="download-item-description">
                            {item.description}
                          </p>
                          <div className="download-item-meta">
                            <span className="download-item-version">
                              Version: {item.version}
                            </span>
                            <div className="download-item-rating">
                              <ReactStars
                                count={5}
                                value={item.rating}
                                size={20}
                                edit={false}
                                activeColor="#ffd700"
                              />
                              <span className="rating-value">
                                {item.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="download-item-actions">
                        <button
                          className="secondary-button"
                          onClick={() => navigate(`/content/${item.id}`)}
                        >
                          View Details
                        </button>
                        <button
                          className="primary-button"
                          onClick={() =>
                            window.open(item.downloadUrl || "#", "_blank")
                          }
                          disabled={!item.downloadUrl}
                        >
                          Download Again
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "delete" && (
            <div className="profile-section danger-section">
              <h2>Delete Account</h2>

              <div className="danger-box">
                <h3>Warning: This Action Cannot Be Undone</h3>
                <p>
                  Deleting your account will permanently remove all your
                  information from our system. You will lose access to
                  downloaded software, comments, and any other data associated
                  with your account.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    className="danger-button"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete My Account
                  </button>
                ) : (
                  <div className="delete-confirmation">
                    <p>
                      To confirm deletion, please type <strong>DELETE</strong>{" "}
                      in the field below:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmInput}
                      onChange={(e) => setDeleteConfirmInput(e.target.value)}
                      className="form-input"
                      placeholder="Type DELETE here"
                    />
                    <div className="delete-confirmation-buttons">
                      <button
                        className="secondary-button"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmInput("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="danger-button"
                        onClick={handleDeleteAccount}
                        disabled={isLoading || deleteConfirmInput !== "DELETE"}
                      >
                        {isLoading
                          ? "Deleting..."
                          : "Permanently Delete Account"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
