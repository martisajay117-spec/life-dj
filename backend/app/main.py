import os
from collections.abc import Awaitable, Callable

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from backend.app.analysis import normalize_analysis
from backend.app.gemini import (
    GeminiAnalysisError,
    GeminiAnalyzer,
    GeminiConfigurationError,
)
from backend.app.schemas import AnalysisResponse, GeminiAnalysis, TranscriptRequest

Analyzer = Callable[[str], Awaitable[GeminiAnalysis]]


def create_app(analyzer: Analyzer | None = None) -> FastAPI:
    app = FastAPI(title="LIFE DJ AI", version="1.0.0")
    app.state.analyzer = analyzer or GeminiAnalyzer().analyze

    origins = [
        origin.strip()
        for origin in os.getenv(
            "FRONTEND_ORIGINS",
            (
                "http://localhost:5173,http://localhost:4173,"
                "http://127.0.0.1:5173,http://127.0.0.1:4173"
            ),
        ).split(",")
        if origin.strip()
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    @app.exception_handler(RequestValidationError)
    async def sanitized_validation_error(
        request: Request, error: RequestValidationError
    ) -> JSONResponse:
        # Validation errors can contain the submitted transcript; never echo it.
        return JSONResponse(
            status_code=422,
            content={
                "detail": (
                    "Invalid request. Provide a transcript between 1 and 5000 "
                    "characters."
                )
            },
        )

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/api/analyze", response_model=AnalysisResponse)
    async def analyze(payload: TranscriptRequest, request: Request) -> AnalysisResponse:
        try:
            result = await request.app.state.analyzer(payload.transcript)
        except GeminiConfigurationError:
            raise HTTPException(
                status_code=503,
                detail="AI analysis is not configured. Set GEMINI_API_KEY on the backend.",
            ) from None
        except GeminiAnalysisError:
            raise HTTPException(
                status_code=502,
                detail="AI analysis is temporarily unavailable. Please try again.",
            ) from None
        except Exception:
            raise HTTPException(
                status_code=502,
                detail="AI analysis failed. Please try again.",
            ) from None
        return normalize_analysis(result)

    return app


app = create_app()
