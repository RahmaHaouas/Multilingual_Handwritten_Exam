import os, base64, time
import numpy as np
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS

app  = Flask(__name__)
CORS(app)

BASE = os.path.dirname(__file__)

# ─── Optional: load trained ResNet50V2 model ──────────────────────────────────
# Uncomment once weights are placed in  Model/Final/
#
# import keras, tensorflow as tf
# from tensorflow.keras.layers.experimental.preprocessing import StringLookup
#
# MODEL_H5 = os.path.join(BASE, "../../Model/Final/Res50V2Alpha_without_CTC.h5")
# model    = keras.models.load_model(MODEL_H5) if os.path.exists(MODEL_H5) else None
#
# CHARS      = list("ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىي")
# max_len    = 7
# PAD_TOKEN  = 99
# char_to_num = StringLookup(vocabulary=CHARS, mask_token=None)
# num_to_char = StringLookup(vocabulary=char_to_num.get_vocabulary(),
#                             mask_token=None, invert=True)
# ─────────────────────────────────────────────────────────────────────────────


# ── Image helpers ─────────────────────────────────────────────────────────────

def b64_to_img(b64: str):
    data = base64.b64decode(b64)
    arr  = np.frombuffer(data, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)

def img_to_b64(img) -> str:
    _, buf = cv2.imencode(".jpg", img)
    return base64.b64encode(buf).decode()

def limit_size(img, max_px=2000):
    h, w = img.shape[:2]
    if max(h, w) > max_px:
        r   = max_px / max(h, w)
        img = cv2.resize(img, (int(w*r), int(h*r)), interpolation=cv2.INTER_LANCZOS4)
    return img

def preprocess(img):
    """Adaptive threshold + erosion to isolate handwriting."""
    gray  = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    inv   = cv2.bitwise_not(gray)
    thr   = cv2.adaptiveThreshold(inv, 255,
            cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 35, 15)
    k     = np.ones((15, 15), np.uint8)
    erode = cv2.erode(thr, k, iterations=2)
    c     = 50   # crop border noise
    return erode[c:-c, c:-c]

def crop_to_content(img):
    """Remove blank margins using projection histograms."""
    h, w    = img.shape[:2]
    proc    = preprocess(img)
    mask    = proc < 150
    row_sum = mask.sum(axis=1)
    col_sum = mask.sum(axis=0)
    lim_r   = 0.20 * w
    lim_c   = 0.15 * h
    rows    = np.where(row_sum >= lim_r)[0]
    cols    = np.where(col_sum >= lim_c)[0]
    if rows.size == 0 or cols.size == 0:
        return img
    r0, r1  = rows[0], min(rows[-1] + 100, h)
    c0, c1  = max(cols[0], 0), cols[-1]
    return img[r0:r1, c0:c1]


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/health")
def health():
    return jsonify({"status": "ok", "model": "Digital-Ḍād OCR"})


@app.route("/api/preprocess", methods=["POST"])
def api_preprocess():
    """
    Geometric correction & denoising.
    Body: { image: <base64> }
    """
    d = request.get_json(silent=True) or {}
    if "image" not in d:
        return jsonify({"error": "No image"}), 400
    try:
        img = b64_to_img(d["image"])
        img = limit_size(img)
        img = crop_to_content(img)
        img = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)
        return jsonify({"processed": img_to_b64(img)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/ocr", methods=["POST"])
def api_ocr():
    """
    Full OCR pipeline.
    Body: { image: <base64>, lang: 'ar'|'fr'|'en' }
    Returns: { text, processing_time }
    """
    d    = request.get_json(silent=True) or {}
    lang = d.get("lang", "ar")
    t0   = time.time()

    if "image" not in d:
        return jsonify({"error": "No image"}), 400

    try:
        img = b64_to_img(d["image"])
        img = limit_size(img)

        # ─── Real model inference ──────────────────────────────────────────
        # Replace this block with:
        #   text = run_inference(img, lang)
        # where run_inference uses the loaded ResNet50V2 + CTC decoder.
        # ──────────────────────────────────────────────────────────────────
        # STEP 1 — OCR réel avec Gemini Vision
        raw_text = gemini_ocr(img_bytes, lang)

        # STEP 2 — Nettoyage OCR (LLM cleanup)
        clean_text = gemini_cleanup(raw_text, lang)

        text = clean_text

        return jsonify({
            "text":            text,
            "lang":            lang,
            "processing_time": round(time.time() - t0, 2),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/grade", methods=["POST"])
def api_grade():
    """
    Exam grading via Gemini (Vertex AI).
    Body: { ocr_text, questions_answers }
    """
    d = request.get_json(silent=True) or {}
    if not d.get("ocr_text"):
        return jsonify({"error": "No OCR text"}), 400

    try:
        # Plug in Grade.main() here when Vertex AI creds are available:
        # from Exam_Grading.Grade import main as grade_main
        # grades, review = grade_main(d["ocr_text"], d.get("questions_answers",""))
        grades = ("Grading requires Vertex AI credentials.\n"
                  "Add your service account key and uncomment Grade.main() in app.py.")
        return jsonify({"grades": grades, "review": grades})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("Digital OCR backend  →  http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
