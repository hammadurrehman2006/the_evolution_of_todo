"""Recurring task logic using python-dateutil.rrule."""
from datetime import datetime, timedelta
from dateutil.rrule import rrule, DAILY, WEEKLY, MONTHLY, YEARLY
from dateutil.rrule import MO, TU, WE, TH, FR, SA, SU
from typing import Optional, List, Dict
import uuid


# Map RRULE frequency string to python-dateutil constants
FREQ_MAP = {
    'DAILY': DAILY,
    'WEEKLY': WEEKLY,
    'MONTHLY': MONTHLY,
    'YEARLY': YEARLY,
}

# Map weekday abbreviations
WEEKDAY_MAP = {
    'MO': MO, 'TU': TU, 'WE': WE, 'TH': TH, 'FR': FR, 'SA': SA, 'SU': SU,
}


def parse_rrule(rrule_str: str) -> Dict[str, str]:
    """
    Parse iCalendar RRULE string into components.
    
    Example: "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,FR" 
    → {"FREQ": "WEEKLY", "INTERVAL": "2", "BYDAY": "MO,FR"}
    """
    if not rrule_str:
        return {}
    
    parts = {}
    for item in rrule_str.split(';'):
        if '=' in item:
            key, value = item.split('=', 1)
            parts[key.strip()] = value.strip()
    
    return parts


def get_next_occurrence(
    rrule_str: str, 
    start_date: datetime, 
    after: Optional[datetime] = None
) -> Optional[datetime]:
    """
    Calculate next occurrence of recurring task.
    
    Args:
        rrule_str: iCalendar RRULE string (e.g., "FREQ=WEEKLY;BYDAY=MO")
        start_date: When recurrence starts
        after: Find next occurrence after this date (default: now)
    
    Returns:
        Next occurrence datetime or None if recurrence ended
    """
    parts = parse_rrule(rrule_str)
    
    if not parts:
        return None
    
    # Get frequency
    freq = FREQ_MAP.get(parts.get('FREQ', 'WEEKLY'), WEEKLY)
    interval = int(parts.get('INTERVAL', '1'))
    
    # Build rrule kwargs
    kwargs = {
        'freq': freq,
        'dtstart': start_date,
        'interval': interval,
    }
    
    # Handle BYDAY (e.g., MO,FR or 2TU for second Tuesday)
    byday = parts.get('BYDAY')
    if byday:
        weekdays = []
        for day in byday.split(','):
            day = day.strip()
            # Handle numbered weekdays (e.g., 2TU = second Tuesday)
            if len(day) > 2 and day[:-2].lstrip('-').isdigit():
                num = int(day[:-2])
                weekday = WEEKDAY_MAP.get(day[-2:])
                if weekday:
                    weekdays.append(weekday(num))
            else:
                weekday = WEEKDAY_MAP.get(day)
                if weekday:
                    weekdays.append(weekday)
        if weekdays:
            kwargs['byweekday'] = weekdays
    
    # Handle UNTIL (end date)
    until = parts.get('UNTIL')
    if until:
        try:
            # Parse ISO format with or without timezone
            until_date = until.replace('Z', '+00:00')
            kwargs['until'] = datetime.fromisoformat(until_date)
        except (ValueError, AttributeError):
            pass
    
    # Handle COUNT (max occurrences)
    count = parts.get('COUNT')
    if count:
        kwargs['count'] = int(count)
    
    # Create rrule and get next occurrence
    try:
        rule = rrule(**kwargs)
        after_date = after or datetime.utcnow()
        next_occ = rule.after(after_date)
        return next_occ
    except (ValueError, TypeError) as e:
        print(f"Error calculating next occurrence: {e}")
        return None


def get_next_n_occurrences(
    rrule_str: str, 
    start_date: datetime, 
    n: int, 
    after: Optional[datetime] = None
) -> List[datetime]:
    """
    Get next N occurrences of recurring task.
    
    Args:
        rrule_str: iCalendar RRULE string
        start_date: When recurrence starts
        n: Number of occurrences to return
        after: Find occurrences after this date (default: now)
    
    Returns:
        List of next N occurrence datetimes
    """
    parts = parse_rrule(rrule_str)
    
    if not parts:
        return []
    
    freq = FREQ_MAP.get(parts.get('FREQ', 'WEEKLY'), WEEKLY)
    interval = int(parts.get('INTERVAL', '1'))
    
    kwargs = {
        'freq': freq,
        'dtstart': start_date,
        'interval': interval,
    }
    
    # Handle BYDAY
    byday = parts.get('BYDAY')
    if byday:
        weekdays = []
        for day in byday.split(','):
            day = day.strip()
            if len(day) > 2 and day[:-2].lstrip('-').isdigit():
                num = int(day[:-2])
                weekday = WEEKDAY_MAP.get(day[-2:])
                if weekday:
                    weekdays.append(weekday(num))
            else:
                weekday = WEEKDAY_MAP.get(day)
                if weekday:
                    weekdays.append(weekday)
        if weekdays:
            kwargs['byweekday'] = weekdays
    
    # Handle UNTIL
    until = parts.get('UNTIL')
    if until:
        try:
            until_date = until.replace('Z', '+00:00')
            kwargs['until'] = datetime.fromisoformat(until_date)
        except (ValueError, AttributeError):
            pass
    
    # Handle COUNT
    count = parts.get('COUNT')
    if count:
        kwargs['count'] = int(count)
    
    try:
        rule = rrule(**kwargs)
        after_date = after or datetime.utcnow()
        
        occurrences = []
        current = rule.after(after_date)
        for _ in range(n):
            if current is None:
                break
            occurrences.append(current)
            current = rule.after(current)
        
        return occurrences
    except (ValueError, TypeError):
        return []


def create_next_instance(task_data: dict) -> Optional[dict]:
    """
    Create next instance of a recurring task.
    
    Args:
        task_data: Original task data including recurrence_rule
    
    Returns:
        New task data with updated due_date, or None if no next instance
    """
    recurrence_rule = task_data.get('recurrence_rule')
    original_due_date = task_data.get('due_date')
    
    if not recurrence_rule or not original_due_date:
        return None
    
    # Parse original due date
    if isinstance(original_due_date, str):
        try:
            original_due_date = datetime.fromisoformat(original_due_date.replace('Z', '+00:00'))
        except ValueError:
            return None
    
    # Calculate next occurrence
    next_due = get_next_occurrence(recurrence_rule, original_due_date)
    
    if not next_due:
        return None
    
    # Create new task data
    new_task = task_data.copy()
    new_task['due_date'] = next_due
    new_task['id'] = str(uuid.uuid4())  # New unique ID
    new_task['client_request_id'] = None  # Clear idempotency key
    
    return new_task
