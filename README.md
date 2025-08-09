# 🌿 An Image-Based Approach for Early Detection and Classification of Crop Leaf Diseases 

![Banner](https://img.shields.io/badge/AI-Plant%20Health-brightgreen?style=for-the-badge)  
![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=for-the-badge&logo=python)  
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange?style=for-the-badge&logo=tensorflow)  
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)  

---

## 📌 About the Project  
The **Plant Disease Detection & Diagnosis System** is a **deep learning-powered solution** designed to **identify 30 different crop leaf diseases** with an impressive **97.5% accuracy**.  
It uses a **Custom Convolutional Neural Network (CNN) with Transfer Learning** to deliver **fast, reliable, and real-time predictions**, making it ideal for **mobile and low-resource environments**.  

### 🎯 Key Highlights  
- **High Accuracy**: 97.5% on test datasets  
- **Real-time Predictions**: ~6 seconds per inference  
- **Lightweight & Mobile Friendly**: Suitable for deployment on edge devices  
- **Interpretable AI**: Includes confusion matrix, F1-confidence curves, and visualization modules  
- **Beyond Detection**: Provides **treatment recommendations** for identified diseases  

---

## 🧠 How It Works  

### Workflow  
1. **Image Capture**: Farmer captures a photo of a diseased leaf.  
2. **Preprocessing**: Image is cropped, resized, noise-reduced, and normalized.  
3. **Feature Extraction**: CNN + Transfer Learning model processes the image.  
4. **Prediction**: Outputs the most probable disease class with confidence scores.  
5. **Treatment Suggestion**: Displays recommended remedies.  
6. **Visualization**: Displays top 3 predictions, F1-confidence curve, and confusion matrix.  

📌 **Architecture Diagram**:  


---

## 🛠 Tech Stack  

**Programming Language:**  
- Python 3.8+  

**Deep Learning Frameworks:**  
- TensorFlow / Keras  

**Supporting Libraries:**  
- OpenCV  
- NumPy & Pandas  
- Matplotlib & Seaborn  

**Model Architecture:**  
- Custom CNN + Transfer Learning (EfficientNet-based)  

**Deployment Options:**  
- Web Application  
- Mobile App (Future Scope via TensorFlow Lite)  

---

## 📂 Dataset  
- **30 Classes** of plant diseases  
- Organized into `train`, `validation`, and `test` sets  
- Balanced dataset with 80% training, 10% validation, 10% testing  

---


## 📊 Results  

| **Metric**            | **Value** |
|-----------------------|-----------|
| **Accuracy**          | 🏆 **97.5%** |
| **Inference Time**    | ⚡ ~6 seconds per image |
| **Top Performing Classes** | 🍅 Tomato Leaf Mold (Precision: 0.90) <br> 🍅 Tomato Mosaic Virus (Precision: 0.87) <br> 🍇 Grape Leaf Black Rot (Precision: 0.90) |

- 📈 **F1-Confidence Curve**: Helps fine-tune decision thresholds for optimal performance.  
- 📉 **Normalized Confusion Matrix**: Highlights common misclassifications to guide model refinement.  

---

## 📷 Example Output  

| **Input Leaf** | **Prediction**          | **Confidence** | **Treatment Suggestion** |
|----------------|------------------------|---------------|--------------------------|
| *(Sample Leaf Image)* | Tomato Leaf Curl Virus | 70.03%        | Use disease-free seedlings, control whiteflies |

---

## 🔮 Future Scope  

- 📱 **Mobile App Deployment** using TensorFlow Lite for on-field diagnosis.  
- 🌐 **Cloud-Based Multi-User Platform** for farmer communities and agricultural agencies.  
- 📡 **IoT Integration** for continuous plant health monitoring.  
- 🌈 **Multi-Spectral Imaging Support** for enhanced disease detection accuracy.  

---

## 👨‍💻 Authors  

| Name              | Register No.       | Role |
|-------------------|--------------------|------|
| **Bhavesh P**     | RA2211026010267    | Research & Development |
| **Mohith Sai A**  | RA2211026010304    | Research & Implementation |
| **Nidarshan M V** | RA2211026010311    | Data Processing & Analysis |
| **Dr. T. Grace Shalini** | —          | Supervisor & Guidance |

---

## 📄 Research Paper  

📌 **Title:** *An Image-Based Approach for Early Detection and Classification of Crop Leaf Diseases*  
📥 **View Paper:** [Click Here](https://ieeexplore.ieee.org/document/11085900) 
✍️ **Published In:** 2025 6th International Conference on Intelligent Communication Technologies and Virtual Mobile Networks (ICICV)
✍️ **Published by:** IEEE

---
