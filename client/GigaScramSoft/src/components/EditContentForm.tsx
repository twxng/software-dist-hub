import React, { useState, useEffect, useMemo } from 'react';
import { ContentUnit, SubCategory, MainCategory, ContentUnitDTO } from '../types/content';
import { contentService } from '../services/contentService';
import '../styles/components/EditContentForm.css';
import { useAuthStore } from '../store/authStore';
import { formatImageUrl, convertFileToBase64, revokeImageUrls, stripBase64Prefix } from '../utils/imageUtils';

/**
 * Props for the EditContentForm component.
 * @interface EditContentFormProps
 * @property {number} contentId - ID of the content to edit.
 * @property {() => void} onSuccess - Function to call on successful edit.
 * @property {() => void} onClose - Function to call when the form is closed.
 */
interface EditContentFormProps {
  contentId: number;
  onSuccess: () => void;
  onClose: () => void;
}

const EditContentForm: React.FC<EditContentFormProps> = ({ contentId, onSuccess, onClose }) => {
  const [content, setContent] = useState<ContentUnit | null>(null);
  const [formData, setFormData] = useState({
    header: '',
    shortDescription: '',
    fullDescription: '',
    previewImage: '',
    downloadLink: '',
    subCategoryId: 0,
    images: [] as string[]
  });

  const [selectedMainCategory, setSelectedMainCategory] = useState<number>(0);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [imageFilesUrls, setImageFilesUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<SubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token, userRole } = useAuthStore();

  useEffect(() => {
    loadContent();
    loadCategories();
  }, [contentId]);

  useEffect(() => {
    return () => {
      if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
      revokeImageUrls(imageFilesUrls);
    };
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const response = await contentService.getContentById(contentId);
      
      if (response.statusCode === 200 && response.data) {
        setContent(response.data);
        setFormData({
          header: response.data.header,
          shortDescription: response.data.shortDescription,
          fullDescription: response.data.fullDescription,
          previewImage: response.data.previewImage,
          downloadLink: response.data.downloadLink,
          subCategoryId: response.data.subCategoryId,
          images: response.data.images.map(img => img.value)
        });
        
        if (response.data.subCategory && response.data.subCategory.mainCategory) {
          setSelectedMainCategory(response.data.subCategory.mainCategory.id);
        }
      } else {
        setError('Failed to load content data');
      }
    } catch (err) {
      console.error('Error loading content:', err);
      setError('Error loading content');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await contentService.getCategories();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Error loading categories');
    }
  };

  
  const mainCategories = useMemo(() => {
    const grouped = categories.reduce((acc, subCategory) => {
      const mainCategory = subCategory.mainCategory;
      if (!acc[mainCategory.id]) {
        acc[mainCategory.id] = {
          ...mainCategory,
          subCategories: []
        };
      }
      acc[mainCategory.id].subCategories.push(subCategory);
      return acc;
    }, {} as Record<number, MainCategory & { subCategories: SubCategory[] }>);
    
    return Object.values(grouped);
  }, [categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('You are not authorized. Please log in.');
      return;
    }
    
    if (userRole !== 'Admin') {
      setError('You do not have permission to edit content. Admin role is required.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    console.log('Authorization token:', localStorage.getItem('token'));
    console.log('Additional images to upload:', imageFiles.length);

    try {
      
      const selectedSubCategory = categories.find(cat => cat.id === formData.subCategoryId);
      
      if (!selectedSubCategory) {
        throw new Error('Please select a valid subcategory');
      }

      
      let previewImageBase64 = formData.previewImage;
      if (previewFile) {
        previewImageBase64 = await convertFileToBase64(previewFile, undefined, true);
      } else if (previewImageBase64.startsWith('data:')) {
        previewImageBase64 = stripBase64Prefix(previewImageBase64);
      }

      
      let imageBase64Array = [...formData.images];
      
      imageBase64Array = imageBase64Array.map(img => 
        img.startsWith('data:') ? stripBase64Prefix(img) : img
      );
      
      
      if (imageFiles.length > 0) {
        console.log('Converting additional images to base64...');
        try {
          const newImagesPromises = imageFiles.map(file => convertFileToBase64(file, undefined, true));
          const newImagesBase64 = await Promise.all(newImagesPromises);
          console.log('Successfully converted images:', newImagesBase64.length);
          imageBase64Array = [...imageBase64Array, ...newImagesBase64];
        } catch (conversionError) {
          console.error('Error converting images:', conversionError);
          throw new Error('Error processing additional images');
        }
      }

      
      const contentData: ContentUnitDTO = {
        header: formData.header,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription,
        previewImage: previewImageBase64,
        downloadLink: formData.downloadLink,
        subCategoryName: selectedSubCategory.name,
        images: imageBase64Array
      };

      console.log('Sending data with number of additional images:', contentData.images.length);

      const response = await contentService.updateContent(contentId, contentData);
      
      if (!response.data) {
        throw new Error(response.message || 'Failed to update content');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving content:', err);
      setError(err instanceof Error ? err.message : 'Failed to save content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mainCategoryId = parseInt(e.target.value);
    setSelectedMainCategory(mainCategoryId);
    setFormData(prev => ({ ...prev, subCategoryId: 0 }));
  };

  const handlePreviewFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPreviewFile(file);
      
      if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
      const url = URL.createObjectURL(file);
      setPreviewImageUrl(url);
    }
  };

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      console.log('Selected additional images:', files.length);
      setImageFiles(files);
      
      
      imageFilesUrls.forEach(url => URL.revokeObjectURL(url));
      
      
      const urls = files.map(file => URL.createObjectURL(file));
      setImageFilesUrls(urls);
    }
  };

  if (isLoading && !content) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="edit-content-form-overlay">
      <div className="edit-content-form">
        {error && <div className="error-message">{error}</div>}
        <h2>Edit Software</h2>
        <div className="content-id-field">
          <label htmlFor="contentId">Content ID:</label>
          <input 
            type="text" 
            id="contentId" 
            value={contentId} 
            disabled 
          />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="header">Title*</label>
            <input
              id="header"
              type="text"
              value={formData.header}
              onChange={(e) => setFormData({ ...formData, header: e.target.value })}
              required
              placeholder="Enter title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="shortDescription">Short Description*</label>
            <textarea
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              required
              placeholder="Enter short description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullDescription">Full Description*</label>
            <textarea
              id="fullDescription"
              value={formData.fullDescription}
              onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
              required
              className="full-description"
              placeholder="Enter full description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="previewImage">Preview Image</label>
            <div className="file-input-container">
              <input
                id="previewImage"
                type="file"
                accept="image/*"
                onChange={handlePreviewFileChange}
                title="Select preview image"
              />
              <div className="file-input-help">
                {previewFile ? `Selected file: ${previewFile.name}` : 'Current image will be saved if new one is not selected'}
              </div>
            </div>
            {(formData.previewImage || previewImageUrl) && (
              <div className="image-preview-container">
                <div className="image-preview-title">Current Image:</div>
                <img 
                  src={previewImageUrl || formatImageUrl(formData.previewImage)} 
                  alt="Preview" 
                  className="image-preview" 
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="downloadLink">Download Link*</label>
            <input
              id="downloadLink"
              type="url"
              value={formData.downloadLink}
              onChange={(e) => setFormData({ ...formData, downloadLink: e.target.value })}
              required
              placeholder="Enter download link"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mainCategory">Main Category*</label>
            <select
              id="mainCategory"
              value={selectedMainCategory}
              onChange={handleMainCategoryChange}
              required
            >
              <option value="">Select main category</option>
              {mainCategories.map(main => (
                <option key={main.id} value={main.id}>
                  {main.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subCategory">Subcategory*</label>
            <select
              id="subCategory"
              value={formData.subCategoryId}
              onChange={(e) => setFormData({ ...formData, subCategoryId: parseInt(e.target.value) })}
              required
              disabled={!selectedMainCategory}
            >
              <option value="">Select subcategory</option>
              {selectedMainCategory > 0 &&
                mainCategories
                  .find(main => main.id === selectedMainCategory)
                  ?.subCategories.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="additionalImages">Additional Images</label>
            <div className="file-input-container">
              <input
                id="additionalImages"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImagesChange}
                title="Select additional images"
              />
              <div className="file-input-help">
                {imageFiles.length > 0 ? 
                  `Selected files: ${imageFiles.length}` : 
                  'Select one or more images for the gallery'}
              </div>
            </div>
            {(formData.images.length > 0 || imageFilesUrls.length > 0) && (
              <div className="image-preview-container">
                <div className="image-preview-title">Current Additional Images:</div>
                <div className="additional-images-preview">
                  {formData.images.map((img, index) => (
                    <img key={`existing-${index}`} src={formatImageUrl(img)} alt={`Additional ${index}`} className="image-preview" />
                  ))}
                  {imageFilesUrls.map((url, index) => (
                    <img key={`new-${index}`} src={url} alt={`New Additional ${index}`} className="image-preview" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContentForm; 