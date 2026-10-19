# Wan 2.2 Animate serverless worker for RunPod.
# Base: official RunPod ComfyUI worker (ComfyUI + handler + start scripts).
FROM runpod/worker-comfyui:5.10.0-base

# Custom nodes for the Wan Animate replace workflow
# (KJNodes helpers, DWPose via controlnet_aux, SAM2 segmentation).
RUN comfy-node-install comfyui-kjnodes comfyui_controlnet_aux comfyui-segment-anything-2

# comfy-node-install pip-installs the packs' dependencies into ComfyUI's
# own /comfyui/.venv, but this image launches ComfyUI with /opt/venv —
# without this mirror step the packs fail to import at runtime and their
# node classes never register (found via the first endpoint test job:
# "Node 'DWPreprocessor' not found").
RUN for r in /comfyui/custom_nodes/*/requirements.txt; do \
      [ -f "$r" ] && uv pip install --python /opt/venv/bin/python -r "$r" || true; \
    done

# Build-time gate: boot ComfyUI exactly as the worker will (same python,
# same workspace) and assert every node class the workflow needs is
# registered. A pack that fails to import fails the build, with the
# ComfyUI boot log printed for diagnosis.
COPY verify_nodes.py /verify_nodes.py
RUN cd /comfyui && (timeout 600 /opt/venv/bin/python main.py --cpu --port 8199 > /tmp/comfy_boot.log 2>&1 &) && \
    ok=0; for i in $(seq 1 100); do if wget -q -O /tmp/object_info.json http://127.0.0.1:8199/object_info; then ok=1; break; fi; sleep 4; done; \
    if [ "$ok" = "1" ]; then python3 /verify_nodes.py /tmp/object_info.json; else echo "ComfyUI did not answer /object_info"; exit 1; fi || { echo "=== COMFY BOOT LOG (tail) ==="; tail -150 /tmp/comfy_boot.log; exit 1; }

# Patched handler: also returns video outputs (SaveVideo reports under
# "videos", the stock handler only collects "images").
COPY handler.py /handler.py
