#!/usr/bin/env python3
"""Build-time gate: assert every node class the Wan Animate workflow
needs is registered in ComfyUI's /object_info. Fails the image build
(with the missing list) if a custom node pack did not load."""
import json
import sys

REQUIRED = [
    "BlockifyMask", "CLIPLoader", "CLIPTextEncode", "CLIPVisionEncode",
    "CLIPVisionLoader", "CreateVideo", "DWPreprocessor",
    "DownloadAndLoadSAM2Model", "DrawMaskOnImage", "GetVideoComponents",
    "GrowMask", "ImageFromBatch", "ImageScale", "KSampler", "LoadImage",
    "LoadVideo", "LoraLoaderModelOnly", "ModelSamplingSD3",
    "PixelPerfectResolution", "PointsEditor", "PrimitiveInt",
    "Sam2Segmentation", "SaveVideo", "TrimVideoLatent", "UNETLoader",
    "VAEDecode", "VAELoader", "WanAnimateToVideo",
]

info = json.load(open(sys.argv[1]))
missing = [c for c in REQUIRED if c not in info]
if missing:
    print("MISSING NODE CLASSES:", missing)
    sys.exit(1)
print(f"all {len(REQUIRED)} required node classes registered")
