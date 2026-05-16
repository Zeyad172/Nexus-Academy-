---
title: Nexus Academy Backend
emoji: 🎓
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# Nexus Academy Backend API

This is the backend for the Nexus Academy platform, running in a Docker container on Hugging Face Spaces.

## 🚀 Deployment Notes
- **Port:** Hugging Face Spaces uses port `7860`.
- **Environment Variables:** Set your `.env` variables in the Space's **Settings > Variables and Secrets** tab.
- **Persistence:** Local file storage (`public/uploads`) is ephemeral. Images and videos are correctly offloaded to Google Drive in this implementation.
