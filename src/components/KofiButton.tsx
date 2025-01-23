import React from 'react';
import { Coffee } from 'lucide-react';

const KofiButton = ({ username = "fractaloutlook" }) => {
  const handleKofiClick = () => {
    window.open(`https://ko-fi.com/${username}`, '_blank');
  };

  return (
    <button
      onClick={handleKofiClick}
      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
    >
      <Coffee size={20} />
      <span>Support This Experiment ($25)</span>
    </button>
  );
};

export default KofiButton;