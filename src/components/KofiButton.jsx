import React, { useState } from 'react';
import { Coffee, X } from 'lucide-react';

const KofiButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper function to construct the Ko-fi iframe URL with our parameters
  const getKofiUrl = () => {
    const baseUrl = 'https://ko-fi.com/timschei';
    const params = new URLSearchParams({
      'hidefeed': 'true',
      'widget': 'true',
      'embed': 'true',
      'donation_amount': '25',
      'title': 'Support This Experiment'
    });
    return `${baseUrl}/?${params.toString()}`;
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Restore scrolling
    document.body.style.overflow = 'unset';
  };

  return (
    <>
      {/* Main button */}
      <button
        onClick={handleButtonClick}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
      >
        <Coffee size={20} />
        <span>Support This Experiment ($25)</span>
      </button>

      {/* Modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Dark background overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeModal}
          />
          
          {/* Modal content */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            
            {/* Ko-fi iframe */}
            <div className="p-4">
              <iframe
                id="kofiframe"
                src={getKofiUrl()}
                className="w-full h-[680px]"
                style={{ border: 'none' }}
                title="Support This Experiment"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KofiButton;