"use client"; // Mark this component as a Client Component

import React, { useState } from "react";
import axios from "axios";

interface ImageUploaderProps {
    onPrediction: (disease: string, confidence: number) => void;
    onTopPredictions: (topPredictions: { disease: string; confidence: number }[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onPrediction, onTopPredictions }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        validateAndSetFile(selectedFile);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const droppedFile = event.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const validateAndSetFile = (selectedFile: File | undefined) => {
        if (selectedFile) {
            const validTypes = ["image/jpeg", "image/png"];
            if (validTypes.includes(selectedFile.type)) {
                setFile(selectedFile);
                setErrorMessage("");
            } else {
                setErrorMessage("Please upload a valid image file (JPEG or PNG).");
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setErrorMessage("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:8000/predict", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const predictions = response.data.predictions;
            if (predictions.length > 0) {
                const topPrediction = predictions[0];
                onPrediction(topPrediction.disease, topPrediction.confidence);
                onTopPredictions(predictions);
            }
            setErrorMessage("");
        } catch (error) {
            setErrorMessage("Error uploading file. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-5 my-5">
            <h1 className="text-2xl font-semibold text-center mb-4">Upload the image</h1>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer
                    ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-100"}
                    transition-all ease-in-out duration-200`}
            >

                {file ? (
                    <div className="flex flex-col items-center gap-2">
                        <img
                            src={URL.createObjectURL(file)}
                            alt="Uploaded preview"
                            className="w-24 h-24 object-cover rounded-md shadow-md"
                        />
                        <p className="text-gray-700 text-sm">{file.name}</p>
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm text-center">
                        Drag & Drop an image file here or <span className="font-semibold">click to upload</span>
                    </p>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <button className="mt-2 bg-gray-500  text-white py-2 px-4 rounded hover:bg-gray-600" onClick={() => document.querySelector('input[type="file"]')?.click()}>Select File</button>
            </div>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <button className="bg-green-500 text-white py-2 px-4 mt-3 rounded hover:bg-green-600" onClick={handleUpload}>Upload</button>
        </div>
    );
};

export default ImageUploader;