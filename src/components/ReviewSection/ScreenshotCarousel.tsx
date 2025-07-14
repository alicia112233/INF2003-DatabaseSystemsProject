'use client';

import { useState } from 'react';

export default function ScreenshotCarousel({ urls }: { urls: string[] }) {
  const images = urls;
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const next = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (images.length === 0) {
    return <p className="text-gray-400">No screenshots available.</p>;
  }

  return (
    <div className="relative w-full max-w-xl mx-auto mt-6 min-w-0">
      <div className="relative w-full h-72 sm:h-80 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center min-w-0">
        {/* Placeholder for loading or missing images */}
        <div className="absolute inset-0 bg-gray-200" />
        <img
          src={images[currentIndex]}
          alt={`Screenshot ${currentIndex + 1}`}
          className="w-full h-full object-cover object-center transition-transform duration-300 absolute inset-0"
          style={{ display: 'block' }}
        />
        <button
          onClick={prev}
          className="absolute top-1/2 left-2 -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full shadow hover:bg-opacity-100 z-10"
          style={{ minWidth: 36, minHeight: 36 }}
        >
          ◀
        </button>
        <button
          onClick={next}
          className="absolute top-1/2 right-2 -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full shadow hover:bg-opacity-100 z-10"
          style={{ minWidth: 36, minHeight: 36 }}
        >
          ▶
        </button>
      </div>
      <div className="text-center mt-2 text-sm text-gray-500">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
