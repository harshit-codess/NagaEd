"""Pure helpers for turning raw LLM output into clean username suggestions.

Kept free of third-party imports so it can be unit-tested anywhere.
"""
import json
import re

USERNAME_ALLOWED = re.compile(r"[^A-Za-z0-9_.-]")
MIN_LEN, MAX_LEN = 3, 30
# Template echoes like "name1", "username_2", "user123" are not real suggestions.
PLACEHOLDER = re.compile(r"^(name|username|user|example)[_.-]?\d*$", re.IGNORECASE)


class LLMOutputError(ValueError):
    """The model answered, but not in a usable form."""


def clean_username(raw: object) -> str | None:
    if not isinstance(raw, str):
        return None
    cleaned = USERNAME_ALLOWED.sub("", raw.strip().lstrip("@"))
    if not (MIN_LEN <= len(cleaned) <= MAX_LEN) or PLACEHOLDER.match(cleaned):
        return None
    return cleaned


def sanitize_interest(text: str) -> str:
    """Collapse whitespace/control characters so user text stays a single plain line."""
    return re.sub(r"[\x00-\x1f\x7f\s]+", " ", text).strip()


def parse_usernames(content: str, count: int = 3) -> list[str]:
    """Extract `count` unique, valid usernames from the model's JSON reply."""
    try:
        data = json.loads(content)
    except (TypeError, json.JSONDecodeError) as exc:
        raise LLMOutputError("Model did not return valid JSON") from exc

    candidates = data.get("usernames") if isinstance(data, dict) else data
    if not isinstance(candidates, list):
        raise LLMOutputError("Model JSON did not contain a 'usernames' list")

    result: list[str] = []
    seen: set[str] = set()
    for item in candidates:
        name = clean_username(item)
        if name and name.lower() not in seen:
            seen.add(name.lower())
            result.append(name)
        if len(result) == count:
            return result
    raise LLMOutputError(f"Model returned fewer than {count} usable usernames")
