# Wan 2.2 Animate serverless worker for RunPod.
# Base: official RunPod ComfyUI worker (ComfyUI + handler + start scripts).
FROM runpod/worker-comfyui:5.10.0-base

# Custom nodes for the Wan Animate replace workflow
# (KJNodes helpers, DWPose via controlnet_aux, SAM2 segmentation).
RUN comfy-node-install comfyui-kjnodes comfyui_controlnet_aux comfyui-segment-anything-2

# Patched handler: also returns video outputs (SaveVideo reports under
# "videos", the stock handler only collects "images").
COPY handler.py /handler.py
