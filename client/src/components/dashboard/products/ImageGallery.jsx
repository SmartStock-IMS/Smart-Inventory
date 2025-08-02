import { useState } from "react";

const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(images[0]); // Set the first image as default

  const handleImageClick = (image) => {
    setSelectedImage(image); // Update the selected image
  };

  return (
    <div className="flex flex-col items-center">
      {/* Large Image */}
      <div className="w-80 h-80 mb-4">
        <img
          src={selectedImage}
          alt="Selected"
          className="w-full h-full object-cover rounded-lg shadow-md"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex space-x-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => handleImageClick(image)}
            className={`w-16 h-16 rounded-lg overflow-hidden border ${
              selectedImage === image
                ? "border-gray-500"
                : "border-transparent hover:border-gray-300"
            }`}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
