import React, { useState, useRef } from 'react';

const Avatar = ({
  firstName = '',
  lastName = '',
  imageUrl = '',
  editable = false,
  onImageUpload, // callback to handle the image file upload
  size = 80 // size in pixels
}) => {
  const [previewUrl, setPreviewUrl] = useState(imageUrl);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef(null);

  // Generate initials based on first and last name.
  const getInitials = () => {
    const fInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${fInitial}${lInitial}`;
  };

  // Handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL to display the image
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setImgError(false);
      if (onImageUpload) {
        onImageUpload(file);
      }
    }
  };

  // If the image fails to load, fallback to initials.
  const handleImageError = () => {
    setImgError(true);
  };

  return (
    <div
      className="relative rounded-full overflow-hidden border bg-gray-200 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {previewUrl && !imgError ? (
        <img
          src={previewUrl}
          alt={`${firstName} ${lastName}`}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <span className="text-xl font-bold text-gray-600">
          {getInitials()}
        </span>
      )}
      {editable && (
        <>
          <div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            <span className="text-white text-sm">Upload</span>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageChange}
          />
        </>
      )}
    </div>
  );
};

export default Avatar;
