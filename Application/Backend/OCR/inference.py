"""
inference.py  ·  Digital-Ḍād OCR
ResNet50V2 + CTC inference on a preprocessed word image.
"""

import os
import numpy as np

# ── Lazy imports so the file is importable without TF installed ───────────────
try:
    import tensorflow as tf
    import keras
    from tensorflow.keras.layers.experimental.preprocessing import StringLookup
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

# ── Character set (36 Arabic characters used during training) ─────────────────
CHARACTERS = sorted([
    'ء','آ','أ','ؤ','إ','ئ','ا','ب','ة','ت','ث','ج','ح','خ',
    'د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق',
    'ك','ل','م','ن','ه','و','ى','ي'
])
MAX_LEN     = 7
PAD_TOKEN   = 99
IMG_H, IMG_W = 64, 64   # final model uses 64×64


class ArabicOCR:
    """Wrapper around the trained ResNet50V2 model."""

    def __init__(self, model_path: str):
        if not TF_AVAILABLE:
            raise ImportError("TensorFlow is not installed.")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found: {model_path}")

        self.model       = keras.models.load_model(model_path, compile=False)
        self.char_to_num = StringLookup(vocabulary=CHARACTERS, mask_token=None)
        self.num_to_char = StringLookup(
            vocabulary=self.char_to_num.get_vocabulary(),
            mask_token=None, invert=True)

    # ── Preprocessing ─────────────────────────────────────────────────────────
    def prepare_image(self, img_bgr):
        """BGR → 64×64 float32 tensor."""
        import cv2
        img = cv2.resize(img_bgr, (IMG_W, IMG_H))
        img = img.astype("float32") / 255.0
        return np.expand_dims(img, 0)   # (1, 64, 64, 3)

    # ── Decoding ──────────────────────────────────────────────────────────────
    def decode(self, pred):
        input_len = np.ones(pred.shape[0]) * pred.shape[1]
        results   = keras.backend.ctc_decode(
            pred, input_length=input_len, greedy=True)[0][0][:, :MAX_LEN]
        out = []
        for res in results:
            res  = tf.gather(res, tf.where(tf.math.not_equal(res, -1)))
            word = tf.strings.reduce_join(self.num_to_char(res)).numpy().decode("utf-8")
            out.append(word)
        return out

    # ── Inference ─────────────────────────────────────────────────────────────
    def predict(self, img_bgr) -> str:
        x    = self.prepare_image(img_bgr)
        pred = self.model.predict(x, verbose=0)
        return self.decode(pred)[0]

    def predict_batch(self, imgs: list) -> list:
        batch = np.concatenate([self.prepare_image(i) for i in imgs], axis=0)
        preds = self.model.predict(batch, verbose=0)
        return self.decode(preds)


# ── CER metric ────────────────────────────────────────────────────────────────

def character_error_rate(predicted: list, ground_truth: list) -> float:
    """
    CER = total edit distance / total character count.
    Requires: python-Levenshtein
    """
    try:
        from Levenshtein import distance as levenshtein
    except ImportError:
        print("Install python-Levenshtein for CER calculation.")
        return float("nan")

    total_ed = sum(levenshtein(p, g) for p, g in zip(predicted, ground_truth))
    total_ch = sum(len(g) for g in ground_truth)
    return total_ed / total_ch if total_ch else 0.0


# ── Quick test ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys, cv2
    if len(sys.argv) < 3:
        print("Usage: python inference.py <model.h5> <image.jpg>")
        sys.exit(1)

    ocr  = ArabicOCR(sys.argv[1])
    img  = cv2.imread(sys.argv[2])
    word = ocr.predict(img)
    print(f"Predicted: {word}")
