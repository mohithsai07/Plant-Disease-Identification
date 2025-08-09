from flask import Flask, request, jsonify
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np
import os
import tempfile
from PIL import Image

app = Flask(__name__)

MODEL_PATH = "models/plant_disease_model.h5"

# Load the model once during startup
try:
    model = load_model(MODEL_PATH)
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    exit(1)

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
        top_index = np.argmax(predictions[0])
        
        result = {
            "disease": class_mapping.get(top_index, "Unknown Disease"),
            "confidence": float(predictions[0][top_index] * 100)
        }
        return result
    except Exception as e:
        return {"error": str(e)}

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Use a temporary file to save the uploaded image
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        file.save(tmp.name)
        result = detect_disease(tmp.name)

    # Clean up the temporary file
    os.remove(tmp.name)

    return jsonify({"predictions": [result]})

if __name__ == '__main__':
    app.run(debug=True)