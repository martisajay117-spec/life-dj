from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class Mood(str, Enum):
    HEARTBREAK = "heartbreak"
    CRUSH = "crush"
    CONFIDENCE = "confidence"
    COMEBACK = "comeback"
    HAPPINESS = "happiness"
    CALM = "calm"
    NEUTRAL = "neutral"


class Subject(str, Enum):
    USER = "user"
    SOMEONE_ELSE = "someone_else"
    UNCLEAR = "unclear"


class TranscriptRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    transcript: str = Field(min_length=1, max_length=5000)


class GeminiAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mood: Mood
    subject: Subject
    confidence_score: float = Field(ge=0, le=1)
    explanation: str = Field(min_length=1, max_length=240)
    music_category: str = Field(min_length=1, max_length=80)


class AnalysisResponse(GeminiAnalysis):
    needs_confirmation: bool
