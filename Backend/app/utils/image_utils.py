"""Image processing utilities"""

from io import BytesIO
from typing import Optional
from uuid import UUID

from PIL import Image

from app.utils.logging import logger


def convert_to_webp(file_bytes: bytes, quality: int = 85) -> bytes:
    """
    Convert image bytes to WebP format.

    Args:
        file_bytes: Image bytes to convert
        quality: WebP quality (0-100)

    Returns:
        WebP image bytes
    """
    try:
        img = Image.open(BytesIO(file_bytes))
        output = BytesIO()
        img.save(output, format="WEBP", quality=quality)
        return output.getvalue()
    except Exception as e:
        logger.exception(f"Error converting to WebP: {e}")
        return file_bytes


def resize_image(
    file_bytes: bytes,
    width: Optional[int],
    height: Optional[int],
    photo_id: Optional[UUID] = None,
) -> bytes:
    """
    Resize image bytes with optional width/height parameters.

    Args:
        file_bytes: Original image bytes
        width: Optional target width
        height: Optional target height
        photo_id: Optional photo ID for logging

    Returns:
        Resized image bytes (or original if no resize needed/fails)
    """
    if not width and not height:
        return file_bytes

    try:
        img = Image.open(BytesIO(file_bytes))

        # Fix EXIF orientation
        try:
            from PIL.ExifTags import TAGS

            exif_data = img._getexif()
            if exif_data:
                for tag_id, value in exif_data.items():
                    tag = TAGS.get(tag_id, tag_id)
                    # Tag 274 is Orientation
                    if tag == "Orientation":
                        if value == 3:
                            img = img.rotate(180, expand=True)
                        elif value == 6:
                            img = img.rotate(270, expand=True)
                        elif value == 8:
                            img = img.rotate(90, expand=True)
                        break
        except Exception as e:
            logger.debug(f"Could not read EXIF orientation: {e}")

        original_width, original_height = img.size
        aspect_ratio = original_width / original_height

        # Determine target dimensions
        if width and height:
            # Both width and height specified: resize to fit, then crop
            if aspect_ratio > 1:  # Wide image
                # Height is limiting factor
                resize_width = int(height * aspect_ratio)
                resize_height = height
            else:  # Tall or square image
                # Width is limiting factor
                resize_width = width
                resize_height = int(width / aspect_ratio)

            # Resize
            if (resize_width, resize_height) != (original_width, original_height):
                img = img.resize((int(resize_width), int(resize_height)), Image.Resampling.LANCZOS)

            # Crop from center to get exact dimensions
            crop_left = (resize_width - width) // 2
            crop_top = (resize_height - height) // 2
            crop_right = crop_left + width
            crop_bottom = crop_top + height

            img = img.crop((crop_left, crop_top, crop_right, crop_bottom))
            logger.info(f"Resized+Cropped photo {photo_id or 'unknown'}: {original_width}x{original_height} -> resize({resize_width}x{resize_height}) -> crop({width}x{height})")

        elif width:
            # Width only: maintain aspect ratio
            new_width = width
            new_height = int(width / aspect_ratio)
            if (new_width, new_height) != (original_width, original_height):
                img = img.resize((int(new_width), int(new_height)), Image.Resampling.LANCZOS)
                logger.info(f"Resized photo {photo_id or 'unknown'}: {original_width}x{original_height} -> {new_width}x{new_height}")

        elif height:
            # Height only: maintain aspect ratio
            new_height = height
            new_width = int(height * aspect_ratio)
            if (new_width, new_height) != (original_width, original_height):
                img = img.resize((int(new_width), int(new_height)), Image.Resampling.LANCZOS)
                logger.info(f"Resized photo {photo_id or 'unknown'}: {original_width}x{original_height} -> {new_width}x{new_height}")

        # Convert back to bytes
        output = BytesIO()
        img.save(output, format="JPEG", quality=85, optimize=True)
        return output.getvalue()

    except ImportError:
        logger.warning("Pillow not installed, returning original image")
        return file_bytes
    except Exception as e:
        logger.exception(f"Error resizing photo {photo_id or 'unknown'}: {e}")
        return file_bytes
