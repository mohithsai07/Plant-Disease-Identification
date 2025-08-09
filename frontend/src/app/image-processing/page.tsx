"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const API_URL = "http://localhost:8000";

export default function ImageProcessingPage() {
  const [uploaded, setUploaded] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("original");
  const [threshold, setThreshold] = useState(128);
  const [imageData, setImageData] = useState<{
    paths?: Record<string, string>;
    folder?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/process-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Image processing failed");
      }

      const data = await response.json();
      setImageData(data);
      setUploaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const applyThreshold = async (newThreshold: number) => {
    if (!imageData.folder) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/apply-threshold`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folder: imageData.folder,
          threshold: newThreshold,
        }),
      });

      if (!response.ok) throw new Error("Threshold update failed");

      const data = await response.json();
      setImageData((prev) => ({
        ...prev,
        paths: { ...prev.paths, threshold: data.path },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Threshold error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentFilter === "threshold") {
      applyThreshold(threshold);
    }
  }, [threshold]);

  return (
    <div className="min-h-screen bg-blue-100 p-8 m-5">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Image Processing
        </h1>

        {/* File Upload */}
        <div className="mb-8">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && handleFileUpload(e.target.files[0])
            }
            accept="image/*"
          />
          <label
            htmlFor="file-upload"
            className={`inline-block px-6 py-2 rounded-lg cursor-pointer ${
              loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            } text-white transition-colors`}
          >
            {loading ? "Processing..." : "Upload Image"}
          </label>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Filter Controls */}
        {uploaded && (
          <div className="mb-8 space-y-4">
            <div className="flex flex-wrap gap-2">
              {["original", "grayscale", "threshold", "edge", "invert"].map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setCurrentFilter(filter)}
                    className={`px-4 py-2 rounded-lg ${
                      currentFilter === filter
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    disabled={loading}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                )
              )}
            </div>

          </div>
        )}

        {/* Image Display */}
        {uploaded && imageData.paths && (
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <div className="relative aspect-square">
              // Update the image URL construction
              <Image
                src={`${API_URL}${imageData.paths[currentFilter]}`}
                alt="Processed Image"
                fill
                className="object-contain"
                unoptimized
                priority
              />
            </div>
            <div className="mt-4 text-center text-sm text-gray-600">
              {currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}{" "}
              View
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
