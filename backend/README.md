# LIFE DJ AI backend

The API analyzes one transcript per request with Gemini. It does not write transcript text to disk or application logs. The transcript is sent to Google Gemini for inference, so this is not an on-device or end-to-end-private analysis. The React form clears its transcript after a successful response.

## Run locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Set GEMINI_API_KEY in .env; never put the key in frontend code.
set -a && source .env && set +a
uvicorn backend.app.main:app --reload --app-dir ..
```

Run the API from the repository root instead with:

```bash
uvicorn backend.app.main:app --reload
```

The endpoint is `POST /api/analyze` with `{"transcript":"..."}`. It returns a mood, who the situation is about, a confidence score from 0 to 1, a short explanation, a music category, and whether playback needs confirmation. Low-confidence results are normalized to `neutral`.

The frontend requests microphone access only after the user presses the microphone button. It uses the browser Web Speech API when available, one-shot sessions capped at 10 seconds, and sends final temporary transcripts to the API. Pause discards the active recognition session; resume starts a fresh one. Microphone and speech recognition require `localhost` or HTTPS in supporting browsers. Browser speech-recognition services may process audio outside LIFE DJ; the app itself does not store raw audio or transcripts. Playback is always user-initiated, ambiguous classifications require confirmation, and stopping a preview puts that mood's mock track on a 30-second replay cooldown.

## Tests

```bash
pip install -r backend/requirements-dev.txt
python -m pytest backend/tests
```
