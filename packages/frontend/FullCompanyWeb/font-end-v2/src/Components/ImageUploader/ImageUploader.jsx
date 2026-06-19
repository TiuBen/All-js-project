import React, { useState } from 'react';

const ImageUploader = () => {
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border border-black flex flex-col items-start space-y-4">
      {imagePreview ? (
        <img
          src={imagePreview}
          alt="Image Preview"
          className="h-40 w-40 rounded-lg object-cover"
        />
      ) : (
        <div className="h-40 w-40 border-2 border-dashed border-gray-400 rounded-lg" />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="py-2 px-4  text-white rounded-lg cursor-pointer"
      />
    </div>
  );
};

export default ImageUploader;
