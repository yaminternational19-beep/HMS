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
        Saves a single uploaded file (from request.FILES) to the uploads root.
        
        @param uploaded_file: The file object from request.FILES
        @param subfolder: Subdirectory name (e.g., 'rooms', 'staff')
        @return: Relative URL path (e.g., '/uploads/rooms/unique_name.jpg') to store in DB
        """
        if not uploaded_file:
            return ""

        # 1. Establish directory path (e.g., C:/.../hotel-backend/uploads/rooms/)
        upload_dir = os.path.join(settings.MEDIA_ROOT, subfolder)
        os.makedirs(upload_dir, exist_ok=True)

        # 2. Extract and sanitize file extension
        orig_name = uploaded_file.name
        ext = os.path.splitext(orig_name)[1].lower()

        # 3. Generate globally unique filename to avoid system collisions (e.g., UUID + extension)
        unique_filename = f"{uuid.uuid4().hex}{ext}"

        # 4. Save file to disk using Django's FileSystemStorage
        fs = FileSystemStorage(location=upload_dir, base_url=f"{settings.MEDIA_URL}{subfolder}/")
        saved_name = fs.save(unique_filename, uploaded_file)

        # 5. Build and return the database-facing public URL
        # E.g., '/uploads/rooms/unique_name.jpg'
        return f"{settings.MEDIA_URL}{subfolder}/{saved_name}"

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
