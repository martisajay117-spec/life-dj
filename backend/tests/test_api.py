from fastapi.testclient import TestClient

from backend.app.gemini import GeminiAnalysisError
from backend.app.main import create_app
from backend.app.schemas import GeminiAnalysis, Mood, Subject


def test_analyze_returns_structured_result_and_passes_transcript_ephemerally() -> None:
    received = []

    async def fake_analyzer(transcript: str) -> GeminiAnalysis:
        received.append(transcript)
        return GeminiAnalysis(
            mood=Mood.CRUSH,
            subject=Subject.USER,
            confidence_score=0.94,
            explanation="The conversation describes a mutual new connection.",
            music_category="warm indie pop",
        )

    client = TestClient(create_app(analyzer=fake_analyzer))
    response = client.post(
        "/api/analyze",
        json={"transcript": "I've been seeing someone and feel excited."},
    )

    assert response.status_code == 200
    assert received == ["I've been seeing someone and feel excited."]
    assert response.json() == {
        "mood": "crush",
        "subject": "user",
        "confidence_score": 0.94,
        "explanation": "The conversation describes a mutual new connection.",
        "music_category": "warm indie pop",
        "needs_confirmation": False,
    }


def test_validation_error_does_not_echo_transcript() -> None:
    client = TestClient(create_app(analyzer=lambda _: None))
    private_text = "my private conversation"
    response = client.post(
        "/api/analyze",
        json={"transcript": f"{private_text}{'x' * 5000}"},
    )

    assert response.status_code == 422
    assert private_text not in response.text


def test_gemini_failure_returns_sanitized_error() -> None:
    async def failing_analyzer(_: str) -> GeminiAnalysis:
        raise GeminiAnalysisError

    client = TestClient(create_app(analyzer=failing_analyzer))
    response = client.post(
        "/api/analyze", json={"transcript": "temporary private transcript"}
    )

    assert response.status_code == 502
    assert "temporary private transcript" not in response.text


def test_loopback_frontend_origin_is_allowed() -> None:
    client = TestClient(create_app(analyzer=lambda _: None))
    response = client.options(
        "/api/analyze",
        headers={
            "Origin": "http://127.0.0.1:4173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:4173"
