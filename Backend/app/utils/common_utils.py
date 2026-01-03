"""Common utility functions"""
from datetime import datetime, timezone
from typing import Union


def get_utc_now(format: str = None) -> Union[datetime, str]:
    """
    Get current UTC time
    
    Args:
        format: Optional datetime format string (e.g., "%Y-%m-%d %H:%M:%S")
                If provided, returns formatted string. Otherwise returns datetime object.
    
    Returns:
        datetime object if format is None, otherwise formatted string
        
    Examples:
        >>> get_utc_now()
        datetime.datetime(2026, 1, 2, 10, 30, 45, 123456, tzinfo=datetime.timezone.utc)
        
        >>> get_utc_now("%Y-%m-%d")
        '2026-01-02'
        
        >>> get_utc_now("%Y-%m-%d %H:%M:%S")
        '2026-01-02 10:30:45'
    """
    now = datetime.now(timezone.utc)
    
    if format:
        return now.strftime(format)
    
    return now
