// src/components/PredictionResult.tsx

import React from 'react';

interface PredictionResultProps {
  disease: string;
  confidence: number;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ disease, confidence }) => {
  // Determine the color based on confidence level
  const confidenceColor = confidence > 75 ? "text-green-600" : confidence > 50 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="flex flex-col bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-5 my-5">
      <h2 className="text-lg font-bold">Prediction Result</h2>
      <div className="mt-2">
        <p className="text-gray-700 my-2">
          <span className="font-semibold border-2 lg:rounded p-1 my-2">Disease:</span> {disease}
        </p>
        <p className={`my-4 ${confidenceColor}`}>
          <span className="font-semibold border-2 lg:rounded p-1">Confidence:</span> {confidence.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

export default PredictionResult;