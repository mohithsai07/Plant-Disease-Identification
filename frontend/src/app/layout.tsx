// src/app/layout.tsx
"use client";
import "./globals.css";
import Menu from "../components/Menu";
import Navbar from "../components/Navbar";
import ImageUploader from "../components/ImageUploader";
import PredictionResult from "../components/PredictionResult";
import PredictionStats from "../components/PredictionStats";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [prediction, setPrediction] = useState<{ disease: string; confidence: number } | null>(null);
  const [predictions, setPredictions] = useState<{ disease: string; confidence: number }[]>([]);

  const handlePrediction = (disease: string, confidence: number) => {
    setPrediction({ disease, confidence });
  };

  const handleTopPredictions = (topPredictions: { disease: string; confidence: number }[]) => {
    setPredictions(topPredictions);
  };

  return (
    <html>
      <body>
        <div className="h-screen flex">
          {/* Left Sidebar - Reduced width */}
          <div className="w-1/6 min-w-[160px] max-w-[200px] bg-white p-2 border-r border-gray-200">
            <Link href="/" className="flex items-center justify-center gap-2 p-2 hover:bg-gray-50 rounded">
            <div className="flex items-center justify-center rounded-lg lg:block text-sm bg-slate-400 w-full  h-10 font-medium">
              <span className=" items-center font-medium">Navigation</span>
              </div>
            </Link>
            <Menu />
          </div>

          {/* Main Content Area - Optimized spacing */}
          <div className="flex-1 bg-gray-50 flex flex-col">
            <Navbar />
            
            <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 overflow-auto">
              {/* Upload Section */}
              <div className="flex flex-col gap-4 flex-1 min-w-[300px]">
                <ImageUploader 
                  onPrediction={handlePrediction} 
                  onTopPredictions={handleTopPredictions} 
                />
                {prediction && (
                  <PredictionResult 
                    disease={prediction.disease} 
                    confidence={prediction.confidence} 
                  />
                )}
              </div>

              {/* Stats Section - Now properly spaced */}
              <div className="min-w-[760px] h-full mt-4 p-1">
                {predictions.length > 0 && (
                  <PredictionStats predictions={predictions} />
                )}
              </div>
            </div>

            {children}
          </div>
        </div>
      </body>
    </html>
  );
}