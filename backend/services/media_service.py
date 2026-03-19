import os
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class MediaService:
    @staticmethod
    def optimize_to_webp(image_path: str, quality: int = 85):
        """
        Converts any image to WebP format and optimizes quality.
        Returns the new path.
        """
        if not os.path.exists(image_path):
            return image_path

        try:
            name, ext = os.path.splitext(image_path)
            if ext.lower() == ".webp":
                return image_path

            webp_path = f"{name}.webp"
            with Image.open(image_path) as img:
                img.save(webp_path, "WEBP", quality=quality)
            
            # Optionally remove the original if desired, but we'll keep for safety in this version
            # os.remove(image_path)
            
            logger.info(f"Image optimized to WebP: {webp_path}")
            return webp_path
        except Exception as e:
            logger.error(f"Media optimization failed for {image_path}: {str(e)}")
            return image_path

media_service = MediaService()
