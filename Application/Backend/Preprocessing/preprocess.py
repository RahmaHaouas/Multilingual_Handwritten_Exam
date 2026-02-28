"""
preprocess.py  ·  Digital-Ḍād OCR
Standalone preprocessing: DocTr geometric correction → denoising → crop
Usage: python preprocess.py <input_image> <output_image>
"""

import sys, os, warnings
warnings.filterwarnings("ignore")
import numpy as np
import cv2


# ── Directional histogram helpers (from 3-image_preprocessing.ipynb) ──────────

def directional_histogram(img, direction="H"):
    w, h    = img.shape
    result  = []
    count   = 0
    if direction == "H":
        for r in range(w - 1):
            for c in range(h - 1):
                if img[r, c] == 255:
                    count += 1
            result.append(count)
            count = 0
    else:
        for c in range(h - 1):
            for r in range(w - 1):
                if img[r, c] == 255:
                    count += 1
            result.append(count)
            count = 0
    return result


def crop_image(image, direction="H"):
    w, h = image.shape
    if w < 10 or h < 10:
        return image
    hist  = directional_histogram(image, direction)
    fhist = list(reversed(hist))
    start = end = 0
    for i in range(1, len(hist) - 1):
        if hist[i-1] == 0 and hist[i] == 0 and hist[i+1] != 0:
            start = i; break
    for i in range(1, len(fhist) - 1):
        if fhist[i-1] == 0 and fhist[i] == 0 and fhist[i+1] != 0:
            end = len(fhist) - 1 - i; break
    diff = abs(start - end)
    if direction == "H" and diff >= 10 and start < end:
        return image[start:end, :]
    elif direction == "V" and diff >= 10 and start < end:
        return image[:, start:end]
    return image


# ── Resize without distortion ─────────────────────────────────────────────────

def distortion_free_resize(img_rgb, target_h=32, target_w=64):
    """Aspect-ratio preserving resize with symmetric padding (NumPy version)."""
    h, w = img_rgb.shape[:2]
    scale  = min(target_w / w, target_h / h)
    nh, nw = int(h * scale), int(w * scale)
    resized = cv2.resize(img_rgb, (nw, nh), interpolation=cv2.INTER_AREA)

    pad_top  = (target_h - nh) // 2
    pad_bot  = target_h - nh - pad_top
    pad_left = (target_w - nw) // 2
    pad_right= target_w - nw - pad_left

    padded = cv2.copyMakeBorder(resized, pad_top, pad_bot, pad_left, pad_right,
                                 cv2.BORDER_CONSTANT, value=(255, 255, 255))
    return padded


# ── Adaptive threshold pipeline ────────────────────────────────────────────────

def binarize(img_gray, block=35, const=15):
    inv   = cv2.bitwise_not(img_gray)
    thr   = cv2.adaptiveThreshold(inv, 255,
                cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, block, const)
    k     = np.ones((15, 15), np.uint8)
    return cv2.erode(thr, k, iterations=2)


def full_preprocess(src_path: str, dst_path: str):
    img = cv2.imread(src_path)
    if img is None:
        raise FileNotFoundError(src_path)

    # 1. Limit resolution
    h, w = img.shape[:2]
    if max(h, w) > 2000:
        r   = 2000 / max(h, w)
        img = cv2.resize(img, (int(w*r), int(h*r)))

    # 2. Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 3. V-crop (remove blank columns)
    cropped = crop_image(gray, "V")

    # 4. Denoising
    denoised = cv2.fastNlMeansDenoising(cropped, h=25,
                    templateWindowSize=15, searchWindowSize=35)

    # 5. Convert to RGB → distortion-free resize → rotate
    rgb     = cv2.cvtColor(denoised, cv2.COLOR_GRAY2RGB)
    resized = distortion_free_resize(rgb, target_h=32, target_w=64)
    final   = cv2.cvtColor(resized, cv2.COLOR_RGB2GRAY)
    final   = np.rot90(final)

    cv2.imwrite(dst_path, final)
    print(f"  Saved → {dst_path}  ({final.shape[1]}×{final.shape[0]})")
    return final


# ── CLI ────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python preprocess.py <input_image> <output_image>")
        sys.exit(1)
    full_preprocess(sys.argv[1], sys.argv[2])
