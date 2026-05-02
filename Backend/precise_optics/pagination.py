from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsPagination(PageNumberPagination):
    """
    Default pagination for all API list endpoints.

    Clients may request a custom page size via ``?page_size=N``.
    The value is capped at MAX_PAGE_SIZE to prevent unbounded result sets.

    Usage:
        GET /api/patients/?page=2&page_size=50
    """

    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'page_size': self.get_page_size(self.request),
            'results': data,
        })

    def get_paginated_response_schema(self, schema):  # pragma: no cover
        return {
            'type': 'object',
            'required': ['count', 'results'],
            'properties': {
                'count': {'type': 'integer'},
                'next': {'type': 'string', 'nullable': True},
                'previous': {'type': 'string', 'nullable': True},
                'page_size': {'type': 'integer'},
                'results': schema,
            },
        }
