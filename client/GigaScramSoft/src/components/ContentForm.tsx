import React, { useState, useEffect, useMemo } from 'react';
import { ContentUnit, SubCategory, MainCategory, CreateContentRequest, ContentUnitDTO } from '../types/content';
import { contentService } from '../services/contentService';
import '../styles/components/ContentForm.css';
import { useAuthStore } from '../store/authStore';

interface ContentFormProps {
  initialData?: ContentUnit;
  onSubmit: (data: ContentUnit) => void;
  onClose: () => void;
}

const ContentForm: React.FC<ContentFormProps> = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<CreateContentRequest>({
    header: '',
    shortDescription: '',
    fullDescription: '',
    previewImage: '',
    downloadLink: '',
    subCategoryId: 0,
    images: []
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
    if (initialData) {
      setFormData({
        header: initialData.header,
        shortDescription: initialData.shortDescription,
        fullDescription: initialData.fullDescription,
        previewImage: initialData.previewImage,
        downloadLink: initialData.downloadLink,
        subCategoryId: initialData.subCategoryId,
        images: initialData.images.map(img => img.value)
      });
      if (initialData.subCategory && initialData.subCategory.mainCategory) {
        setSelectedMainCategory(initialData.subCategory.mainCategory.id);
      }
    }
    loadCategories();
  }, [initialData]);

  useEffect(() => {
    return () => {
      if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
      imageFilesUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading categories...');
      
      const response = await contentService.getCategories();
      console.log('Received data:', response);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Received incorrect data');
      }

      setCategories(response.data);
    } catch (err) {
      console.error('Detailed error:', err);
      setError(err instanceof Error ? err.message : 'Error loading categories');
    } finally {
      setIsLoading(false);
    }
  };

  // Group subcategories by main categories
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

  // Function to convert File to base64 string with size limit
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        try {
          const base64 = reader.result as string;
          console.log(`Розмір зображення ${file.name}: ${Math.round(base64.length / 1024)} KB`);
          
          if (base64.length > 10000000) { 
            console.warn(`Зображення ${file.name} завелике (${Math.round(base64.length / 1024)} KB)`);
          }
          resolve(base64);
        } catch (error) {
          console.error('File processing error:', error);
          reject(error);
        }
      };
      reader.onerror = error => {
        console.error('File reading error:', error);
        reject(error);
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('You are not authorized. Please log in.');
      return;
    }
    
    if (userRole !== 'Admin') {
      setError('You do not have permission to create content. Admin role required.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    console.log('Authorization token:', localStorage.getItem('token'));
    console.log('Additional images for downloading:', imageFiles.length);

    try {
      // Find selected subcategory
      const selectedSubCategory = categories.find(cat => cat.id === formData.subCategoryId);
      
      if (!selectedSubCategory) {
        throw new Error('Please select a valid subcategory');
      }

      // Convert preview file to base64
      let previewImageBase64 = formData.previewImage;
      if (previewFile) {
        previewImageBase64 = await convertFileToBase64(previewFile);
      }

      // Convert additional images to base64
      let imageBase64Array = [...formData.images];
      
      if (imageFiles.length > 0) {
        console.log('Конвертуємо додаткові зображення в base64...');
        try {
          const newImagesPromises = imageFiles.map(file => convertFileToBase64(file));
          const newImagesBase64 = await Promise.all(newImagesPromises);
          console.log('Успішно конвертовано зображень:', newImagesBase64.length);
          imageBase64Array = [...imageBase64Array, ...newImagesBase64];
        } catch (conversionError) {
          console.error('Помилка конвертації зображень:', conversionError);
          throw new Error('Помилка обробки додаткових зображень');
        }
      }

      // Create object for API
      const contentData: ContentUnitDTO = {
        header: formData.header,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription,
        previewImage: previewImageBase64,
        downloadLink: formData.downloadLink,
        subCategoryName: selectedSubCategory.name,
        images: imageBase64Array
      };

      console.log('Send data with the number of additional images:', contentData.images.length);

      let response;
      if (initialData?.id) {
        response = await contentService.updateContent(initialData.id, contentData);
      } else {
        response = await contentService.createContent(contentData);
      }
      
      if (!response.data) {
        throw new Error(response.message || 'Failed to save content');
      }

      onSubmit(response.data);
      onClose();
    } catch (err) {
      console.error('Error saving content:', err);
      setError(err instanceof Error ? err.message : 'Failed to save content');
    } finally {
      setIsLoading(false);
    }
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
      console.log('Обрано додаткових зображень:', files.length);
      setImageFiles(files);
      
      // Очищаємо попередні URL
      imageFilesUrls.forEach(url => URL.revokeObjectURL(url));
      
      // Створюємо нові URL для попереднього перегляду
      const urls = files.map(file => URL.createObjectURL(file));
      setImageFilesUrls(urls);
    }
  };

  const handleMainCategoryChange = (mainCategoryId: number) => {
    setSelectedMainCategory(mainCategoryId);
    setFormData(prev => ({ ...prev, subCategoryId: 0 }));
  };

  const handleSubCategoryChange = (subCategoryId: number) => {
    setFormData(prev => ({ ...prev, subCategoryId }));
  };

  if (isLoading && !categories.length) return <div className="loading">Loading...</div>;

  return (
    <div className="content-form-overlay">
      <div className="content-form">
        {error && <div className="error-message">{error}</div>}
        <h2>{initialData ? 'Edit Software' : 'Add New Software'}</h2>
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
            <label htmlFor="previewImage">Preview Image*</label>
            <input
              id="previewImage"
              type="file"
              accept="image/*"
              onChange={handlePreviewFileChange}
              required={!initialData}
              title="Choose a preview image"
            />
            {(formData.previewImage || previewImageUrl) && (
              <div className="image-preview-container">
                <div className="image-preview-title">Current Preview Image:</div>
                <img 
                  src={previewImageUrl || formData.previewImage} 
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
              onChange={(e) => handleMainCategoryChange(Number(e.target.value))}
              required
              title="Select main category"
            >
              <option value="">Select category</option>
              {mainCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subCategory">Subcategory*</label>
            <select
              id="subCategory"
              value={formData.subCategoryId}
              onChange={(e) => handleSubCategoryChange(Number(e.target.value))}
              required
              disabled={!selectedMainCategory}
              title="Select subcategory"
            >
              <option value="">Select subcategory</option>
              {selectedMainCategory && mainCategories
                .find(c => c.id === selectedMainCategory)
                ?.subCategories.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="additionalImages">Additional Images</label>
            <input
              id="additionalImages"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesChange}
              title="Choose additional images"
            />
            {(formData.images.length > 0 || imageFilesUrls.length > 0) && (
              <div className="image-preview-container">
                <div className="image-preview-title">Current Additional Images:</div>
                <div className="additional-images-preview">
                  {formData.images.map((img, index) => (
                    <img key={`existing-${index}`} src={img} alt={`Additional ${index}`} className="image-preview" />
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
              {isLoading ? 'Saving...' : (initialData ? 'Save' : 'Add')}
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

export default ContentForm;