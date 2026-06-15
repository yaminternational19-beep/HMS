import os
import uuid
from django.conf import settings
from django.core.files.storage import FileSystemStorage

class UploadService:
    """
    Global Zero-Dependency File Upload Service (equivalent to Multer in Node.js).
    Handles file saving, unique naming, and folder routing dynamically.
    """

    @staticmethod
    def upload_single_file(uploaded_file, subfolder: str = 'general') -> str:
        """
        Saves a single uploaded file using Django's default storage (supports Cloudinary).
        
        @param uploaded_file: The file object from request.FILES
        @param subfolder: Subdirectory name (e.g., 'rooms', 'staff')
        @return: URL path to store in DB
        """
        if not uploaded_file:
            return ""

        from django.core.files.storage import default_storage
        import os

        # Extract and sanitize file extension
        orig_name = uploaded_file.name
        ext = os.path.splitext(orig_name)[1].lower()

        # Generate globally unique filename to avoid system collisions (e.g., UUID + extension)
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        
        # Define the path within the storage (e.g. 'rooms/12345.jpg')
        file_path = f"{subfolder}/{unique_filename}"

        # Save file using Django's configured default storage (could be Cloudinary or local)
        saved_path = default_storage.save(file_path, uploaded_file)

        # Return the public URL
        return default_storage.url(saved_path)

    @classmethod
    def upload_multiple_files(cls, uploaded_files_list, subfolder: str = 'general') -> list:
        """
        Saves a list of uploaded files to the uploads root.
        
        @param uploaded_files_list: List of file objects from request.FILES
        @param subfolder: Subdirectory name (e.g., 'rooms')
        @return: List of relative URL paths to store in DB
        """
        saved_paths = []
        if not uploaded_files_list:
            return saved_paths

        for file in uploaded_files_list:
            path = cls.upload_single_file(file, subfolder)
            if path:
                saved_paths.append(path)

        return saved_paths
