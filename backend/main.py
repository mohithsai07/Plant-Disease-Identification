from fastapi import FastAPI, UploadFile, File, HTTPException, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np
import os
import logging
import cv2
from PIL import Image
import tempfile
import uuid
import shutil
from datetime import datetime
from pathlib import Path



# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()


BASE_DIR = Path(__file__).parent.absolute()
FILTERS_DIR = BASE_DIR / "filters"

# Create filters directory if not exists
FILTERS_DIR.mkdir(parents=True, exist_ok=True)
logger.info(f"Filters directory initialized at: {FILTERS_DIR}")

# Mount static directory
app.mount("/filters", StaticFiles(directory=FILTERS_DIR), name="filters")

# Allow CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to the pre-trained model
current_dir = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(current_dir, 'models', 'fine_tuned_model.h5')

# Load the model once during startup
try:
    model = load_model(MODEL_PATH)
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    exit(1)

# Class mapping
class_mapping = { 
    0: "Apple_scab", 1: "Apple_black_rot", 2: "Apple_cedar_apple_rust", 3: "Apple_healthy",
    4: "Blueberry_healthy", 5: "Cherry_powdery_mildew", 6: "Cherry_healthy", 7: "Corn_cercospora_leaf_spot",
    8: "Corn_common_rust", 9: "Corn_northern_leaf_blight", 10: "Corn_healthy", 11: "Grape_black_rot",
    12: "Grape_esca_black_measles", 13: "Grape_leaf_blight", 14: "Grape_healthy", 15: "Orange_haunglongbing",
    16: "Peach_bacterial_spot", 17: "Peach_healthy", 18: "Pepper_bacterial_spot", 19: "Pepper_healthy"
}

IMAGE_SIZE = 224

def detect_disease(image_path):
    try:
        img = Image.open(image_path).convert('RGB')
        img = img.resize((IMAGE_SIZE, IMAGE_SIZE))
        img_array = image.img_to_array(img)
        img_array = preprocess_input(img_array)
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array)
        
        # Get top 3 predictions
        top_indices = np.argsort(predictions[0])[-3:][::-1]
        top_predictions = [
            {
                "disease": class_mapping.get(idx, "Unknown Disease"),
                "confidence": float(predictions[0][idx] * 100)
            }
            for idx in top_indices
        ]
        
        return top_predictions
    except Exception as e:
        return {"error": str(e)}

def create_filter_folder(filename: str) -> Path:
    """Create unique filter folder with timestamp"""
    try:
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_id = uuid.uuid4().hex[:6]
        clean_name = Path(filename).stem.replace(" ", "_")[:20]
        folder_name = f"{timestamp}_{unique_id}_{clean_name}"
        folder_path = FILTERS_DIR / folder_name
        
        logger.info(f"Creating directory: {folder_path}")
        folder_path.mkdir(parents=True, exist_ok=True)
        return folder_path
        
    except Exception as e:
        logger.error(f"Directory creation failed: {str(e)}")
        raise

def save_processed_image(folder_path: Path, image: np.ndarray, filter_name: str) -> str:
    """Save processed image to filter folder"""
    try:
        output_path = folder_path / f"{filter_name}.jpg"
        logger.info(f"Saving {filter_name} image to: {output_path}")
        
        if not cv2.imwrite(str(output_path), image):
            raise ValueError(f"OpenCV failed to write {filter_name} image")
            
        if not output_path.exists():
            raise FileNotFoundError(f"File not created: {output_path}")
            
        return f"/filters/{output_path.relative_to(FILTERS_DIR)}"
        
    except Exception as e:
        logger.error(f"Save image failed: {str(e)}")
        raise

@app.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    folder_path = None
    try:
        # Validate input
        if not file.content_type.startswith("image/"):
            raise HTTPException(400, "Invalid file type. Only images allowed")

        # Create filter folder
        folder_path = create_filter_folder(file.filename)
        logger.info(f"Processing image in: {folder_path}")

        # Read and validate image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(400, "Invalid image file")

        # Save original image
        original_path = save_processed_image(folder_path, img, "original")
        logger.info(f"Original image saved: {original_path}")

        # Process filters
        filters = {
            "grayscale": cv2.cvtColor(img, cv2.COLOR_BGR2GRAY),
            "threshold": cv2.threshold(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), 128, 255, cv2.THRESH_BINARY)[1],
            "edge": cv2.Canny(img, 100, 200),
            "invert": cv2.bitwise_not(img)
        }

        # Save processed images
        filter_paths = {"original": original_path}
        for name, processed in filters.items():
            filter_paths[name] = save_processed_image(folder_path, processed, name)
            logger.info(f"{name} image saved: {filter_paths[name]}")

        return JSONResponse({
            "message": "Image processed successfully",
            "paths": filter_paths,
            "folder": folder_path.name
        })

    except Exception as e:
        logger.error(f"Processing failed: {str(e)}")
        if folder_path and folder_path.exists():
            logger.info(f"Cleaning up failed upload: {folder_path}")
            shutil.rmtree(folder_path, ignore_errors=True)
        raise HTTPException(500, f"Processing failed: {str(e)}")
    
@app.post("/apply-threshold")
async def apply_threshold(filter_request: dict):
    try:
        folder_name = filter_request["folder"]
        threshold = filter_request["threshold"]
        folder_path = FILTERS_DIR / folder_name
        
        logger.info(f"Applying threshold {threshold} to {folder_path}")
        
        if not folder_path.exists():
            raise HTTPException(404, "Image folder not found")
            
        original_path = folder_path / "original.jpg"
        if not original_path.exists():
            raise HTTPException(404, "Original image not found")

        # Read and process image
        img = cv2.imread(str(original_path), cv2.IMREAD_GRAYSCALE)
        _, processed = cv2.threshold(img, threshold, 255, cv2.THRESH_BINARY)
        
        # Save new threshold
        threshold_path = save_processed_image(folder_path, processed, "threshold")
        return JSONResponse({
            "path": threshold_path,
            "threshold": threshold
        })
        
    except Exception as e:
        logger.error(f"Threshold error: {str(e)}")
        raise HTTPException(500, f"Threshold error: {str(e)}")

@app.post('/predict')
async def predict(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No selected file")

    # Use a temporary file to save the uploaded image
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        try:
            contents = await file.read()
            tmp.write(contents)
            tmp.close()  # Close the file to ensure it's saved properly

            results = detect_disease(tmp.name)
        finally:
            os.remove(tmp.name)  # Clean up the temporary file

    return JSONResponse(content={"predictions": results})

@app.post('/upload')
async def upload(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No selected file")

    # Create the uploads directory if it doesn't exist
    uploads_dir = "uploads"
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)

    # Save the uploaded file to the uploads directory
    file_path = os.path.join(uploads_dir, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    return JSONResponse(content={"message": f"File {file.filename} uploaded successfully"})

# New Image Processing Endpoints
@app.post("/apply-filter")
async def apply_filter(
    file: UploadFile = File(...),
    filter_type: str = "original",
    threshold: int = 128
):
    try:
        # Read image file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        # Apply filters
        if filter_type == "grayscale":
            processed = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        elif filter_type == "threshold":
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            _, processed = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY)
        elif filter_type == "edge":
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            processed = cv2.Canny(gray, 100, 200)
        elif filter_type == "invert":
            processed = cv2.bitwise_not(img)
        else:
            processed = img  # Return original

        # Encode processed image
        _, encoded_img = cv2.imencode(".png", processed)
        return Response(
            content=encoded_img.tobytes(),
            media_type="image/png",
            headers={"Cache-Control": "no-cache"}
        )

    except Exception as e:
        logging.error(f"Filter error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

# Run the FastAPI app
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")