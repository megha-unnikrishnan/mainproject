// SkeletonLoader.js
import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="animate-pulse space-y-6">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="bg-white border border-gray-300 shadow-lg rounded-lg p-4 mx-auto"
          style={{ width: '100%', maxWidth: '600px' }}
        >
          <div className="flex items-start mb-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
          <div className="h-48 bg-gray-300 rounded-md mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
