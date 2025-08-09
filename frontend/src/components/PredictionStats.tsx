// src/components/PredictionStats.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Prediction {
  disease: string;
  confidence: number;
}

interface PredictionStatsProps {
  predictions: Prediction[];
}

const PredictionStats: React.FC<PredictionStatsProps> = ({ predictions }) => {
  const data = {
    labels: predictions.map(pred => pred.disease),
    datasets: [{
      label: 'Confidence (%)',
      data: predictions.map(pred => pred.confidence),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }],
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => 
            `${context.label}: ${context.raw.toFixed(2)}%`
        }
      }
    },
    scales: {
      y: { 
        max: 100,
        ticks: { color: '#6b7280' },
        grid: { color: 'rgba(229, 231, 235, 0.5)' }
      },
      x: {
        ticks: { color: '#6b7280' },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Prediction Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">
          Top {predictions.length} predicted diseases with confidence levels
        </p>
      </div>
      
      <div className="flex-1 p-4">
        <div className="h-full">
          <Bar data={data} options={options} />
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Confidence range: {Math.min(...predictions.map(p => p.confidence)).toFixed(1)}% - {Math.max(...predictions.map(p => p.confidence)).toFixed(1)}%
        </p>
      </div>
    </div>
  );
};

export default PredictionStats;