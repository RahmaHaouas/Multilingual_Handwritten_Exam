# Digital Platform — Multilingual Handwritten Exam OCR

> Accurate extraction of Arabic, French, and English student answers from scanned exam sheets,
> with **zero modification** of the original content.

---

## 📁 Project Structure

```
Digital-Dad-OCR/
│
├── Data/
│   ├── Sample_Exams/          ← 9 real exam sheet photos (AR / EN)
│   ├── Training/
│   │   ├── Images/            ← KHATT word images (108,619 samples)
│   │   └── Ground_Truth/      ← UTF-8 label files (.txt per image)
│   ├── Processed/             ← Output of 3-image_preprocessing.ipynb
│   ├── 3-image_preprocessing.ipynb   ← Raw → processed images pipeline
│   ├── 4-augmentation.ipynb          ← -5° rotation augmentation
│   └── Paragraphs_Processing.ipynb   ← Paragraph-level segmentation
│
├── Model/
│   ├── Final/
│   │   └── ResNet50V2_Transfer_Alpha.ipynb   ← FINAL model (97% acc, 3% CER)
│   └── Prototypes/
│       ├── EfficientNetB1.ipynb    ← 10.33% CER  (baseline)
│       ├── VGG19.ipynb             ←  5.40% CER
│       ├── ResNet152.ipynb         ←  2.96% CER  (best prototype → led to ResNet50V2)
│       └── Paper_Best_VGG_WP.ipynb ← VGG19 local experiment
│
└── Application/
    ├── Backend/
    │   ├── app.py                  ← Flask REST API  (port 5000)
    │   ├── requirements.txt
    │   ├── OCR.py                  ← Google Cloud Vision OCR
    │   ├── Grade.py                ← 3-stage Gemini grading pipeline
    │   ├── Preprocessing/
    │   │   ├── preprocess.py       ← Standalone preprocessing script
    │   │   ├── extractor.py        ← DocTr BasicEncoder CNN
    │   │   ├── position_encoding.py← Sinusoidal / learned 2-D PE
    │   │   └── App_Preprocessing_Steps.ipynb
    │   ├── OCR/
    │   │   └── inference.py        ← ResNet50V2 + CTC inference wrapper
    │   └── Exam_Grading/
    │       ├── Grade.py
    │       ├── ocr.txt / ocr_cleaned.txt
    │       ├── grades.txt / grade_review.txt
    │       └── QwAnswers.txt
    └── Frontend/
        └── src/
            └── App.jsx             ← React app (multilingual UI)
```

---

## 🚀 Quick Start

### Backend
```bash
cd Application/Backend
pip install -r requirements.txt
python app.py          # → http://localhost:5000
```

### Frontend
```bash
cd Application/Frontend
npm install            # or: bun install
npm run dev            # → http://localhost:5173
```

---

## 🧠 Model Pipeline

```
Scanned Image
    │
    ▼
DocTr  ──── Geometric correction (GeoTr transformer)
    │        Illumination correction (IllTr ViT, optional)
    ▼
Preprocessing ── Grayscale → V-crop → Denoising
    │             Distortion-free resize to 64×64
    ▼
CRAFT ────── Character region segmentation → word crops
    │
    ▼
ResNet50V2 ── Pre-trained on Arabic Alphabet dataset
    │          Transfer learning on KHATT
    │          CTC loss  ·  Cosine LR decay
    │          Mixed float16  ·  70 epochs
    ▼
CTC Decode ── Greedy search → Arabic word string
    │
    ▼
Gemini Flash ── OCR cleanup (format only, never modify)
```

### Final Model Performance

| Metric       | Value   |
|-------------|---------|
| Accuracy     | **97%** |
| CER (test)   | **3%**  |
| Training set | 80,895  |
| Val set      | 13,862  |
| Test set     | 13,862  |
| Total        | 108,619 |

---

## 🌍 Language Support

| Language | Script | Direction |
|----------|--------|-----------|
| Arabic   | اللغة العربية | RTL (primary) |
| French   | Français | LTR |
| English  | English  | LTR |

---

## 🔒 Integrity Guarantee

The system **never**:
- corrects spelling or grammar
- paraphrases or summarises
- predicts missing content
- hallucinates or adds text

---

## 🗂 API Endpoints

| Method | Path              | Description            |
|--------|------------------|------------------------|
| GET    | `/health`         | Server health check    |
| POST   | `/api/preprocess` | Geometric correction   |
| POST   | `/api/ocr`        | Full OCR extraction    |
| POST   | `/api/grade`      | Exam grading (Gemini)  |
