"""
Shared file upload validators for all document and image fields.
Applied at both model level (full_clean / admin) and serializer level (DRF API).
"""
import os

from django.core.exceptions import ValidationError

MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

ALLOWED_DOCUMENT_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'docx']
ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'tiff', 'tif', 'bmp', 'gif', 'webp']


def validate_file_size(value):
    """Reject files larger than MAX_FILE_SIZE_MB."""
    if hasattr(value, 'size') and value.size > MAX_FILE_SIZE_BYTES:
        raise ValidationError(
            f'File size must not exceed {MAX_FILE_SIZE_MB} MB. '
            f'Uploaded file is {value.size / (1024 * 1024):.1f} MB.'
        )


def validate_document_extension(value):
    """Reject document files with disallowed extensions."""
    if not hasattr(value, 'name'):
        return
    ext = os.path.splitext(value.name)[1].lstrip('.').lower()
    if ext not in ALLOWED_DOCUMENT_EXTENSIONS:
        raise ValidationError(
            f'Unsupported file type ".{ext}". '
            f'Allowed types: {", ".join(ALLOWED_DOCUMENT_EXTENSIONS)}.'
        )


def validate_image_extension(value):
    """Reject image files with disallowed extensions."""
    if not hasattr(value, 'name'):
        return
    ext = os.path.splitext(value.name)[1].lstrip('.').lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError(
            f'Unsupported image type ".{ext}". '
            f'Allowed types: {", ".join(ALLOWED_IMAGE_EXTENSIONS)}.'
        )
