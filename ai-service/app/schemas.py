"""Pydantic models: request/response validation + OpenAPI documentation."""
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

Interest = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50)]


class SuggestRequest(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={"examples": [{"interests": ["astronomy", "jazz", "trail running"]}]},
    )

    interests: list[Interest] = Field(
        ...,
        min_length=1,
        max_length=10,
        description="1-10 short interests / hobbies (each 1-50 characters).",
    )


class SuggestResponse(BaseModel):
    suggestions: list[str] = Field(
        ...,
        min_length=3,
        max_length=3,
        description="Exactly three unique username suggestions.",
    )

    model_config = ConfigDict(
        json_schema_extra={"examples": [{"suggestions": ["StarJazzRunner", "NebulaTrail", "CosmicCadence"]}]}
    )


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: list | None = None


class ErrorResponse(BaseModel):
    error: ErrorDetail
