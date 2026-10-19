# wan-serverless-worker

RunPod serverless worker image for Wan 2.2 Animate character replacement.
Based on runpod/worker-comfyui 5.11.0-base with KJNodes, controlnet_aux
(DWPose) and segment-anything-2 baked in, plus a handler patch so video
outputs (SaveVideo) are returned to the caller. Models live on a RunPod
network volume (models/unet, models/clip, models/clip_vision, models/vae,
models/loras) — they are not in this image.
