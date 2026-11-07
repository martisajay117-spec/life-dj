from backend.app.schemas import AnalysisResponse, GeminiAnalysis, Mood, Subject

LOW_CONFIDENCE_THRESHOLD = 0.65
CONFIRMATION_THRESHOLD = 0.80
NEUTRAL_MUSIC_CATEGORY = "ambient instrumental"


def normalize_analysis(result: GeminiAnalysis) -> AnalysisResponse:
    low_confidence = result.confidence_score < LOW_CONFIDENCE_THRESHOLD
    mood = Mood.NEUTRAL if low_confidence else result.mood
    music_category = (
        NEUTRAL_MUSIC_CATEGORY
        if low_confidence or mood == Mood.NEUTRAL
        else result.music_category
    )

    return AnalysisResponse(
        mood=mood,
        subject=result.subject,
        confidence_score=result.confidence_score,
        explanation=result.explanation,
        music_category=music_category,
        needs_confirmation=(
            result.confidence_score < CONFIRMATION_THRESHOLD
            or result.subject == Subject.UNCLEAR
        ),
    )
