#!/usr/bin/env bash
# Pull the SLM/VLM set from the 3D Website Agent Team Research report.
set -euo pipefail
for m in qwen2.5-coder:7b qwen2.5-coder:14b qwen2.5vl:7b; do
  echo "pull $m"
  ollama pull "$m"
done
ollama list
