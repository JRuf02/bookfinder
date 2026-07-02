"""Timezone / datetime / time of entry utility functions."""

from datetime import datetime, timezone

SECONDS_PER_DAY = 86400


def compute_avg_num_of_days_until_now(timepoints: list[str]) -> int | None:
    """Compute the average number of days passed from each time point until now.
    If no timezone is specified in the timepoints, UTC will be assumed.

    Args:
        timepoints (list[str]): A list of timepoint strings in ISO 8601 format.

    Returns:
        int | None: The average number of days, or None if the list is empty.

    """

    if not timepoints or len(timepoints) == 0:
        return None

    now = datetime.now(tz=timezone.utc)
    total_days = sum(
        (
            now - datetime.fromisoformat(timepoint).astimezone(timezone.utc)
        ).total_seconds()
        / SECONDS_PER_DAY
        for timepoint in timepoints
    )
    return round(total_days / len(timepoints))
