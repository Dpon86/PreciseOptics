"""
Report utility functions
"""
from rest_framework.response import Response


def _get_int_param(request, name, default, min_val=1, max_val=3650):
    """Parse an integer query parameter with bounds checking.
    Returns a 400 Response on invalid input, or the clamped int on success.
    Callers must check: if isinstance(result, Response): return result
    """
    raw = request.GET.get(name, default)
    try:
        value = int(raw)
    except (ValueError, TypeError):
        return Response(
            {'error': f"Invalid value for '{name}': must be an integer."},
            status=400,
        )
    return max(min_val, min(value, max_val))
