"""
AWS S3 utility functions for storing and retrieving model artifacts.
"""
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from typing import Optional, BinaryIO
from loguru import logger

from backend.config import config


class S3Client:
    """S3 client wrapper for model artifact storage."""
    
    def __init__(self):
        """Initialize S3 client with credentials from config."""
        try:
            if config.aws.access_key_id and config.aws.secret_access_key:
                self.s3_client = boto3.client(
                    's3',
                    aws_access_key_id=config.aws.access_key_id,
                    aws_secret_access_key=config.aws.secret_access_key,
                    region_name=config.aws.region
                )
            else:
                # Try to use default credentials (IAM role, etc.)
                self.s3_client = boto3.client('s3', region_name=config.aws.region)
            
            self.bucket_name = config.aws.s3_bucket_name
            logger.info(f"S3 client initialized for bucket: {self.bucket_name}")
        except NoCredentialsError:
            logger.warning("AWS credentials not found. S3 operations will be disabled.")
            self.s3_client = None
            self.bucket_name = None
    
    def upload_file(self, file_path: str, s3_key: str) -> bool:
        """
        Upload a file to S3.
        
        Args:
            file_path: Local file path to upload
            s3_key: S3 object key (path in bucket)
        
        Returns:
            True if successful, False otherwise
        """
        if not self.s3_client or not self.bucket_name:
            logger.warning("S3 client not initialized. Skipping upload.")
            return False
        
        try:
            self.s3_client.upload_file(file_path, self.bucket_name, s3_key)
            logger.info(f"Successfully uploaded {file_path} to s3://{self.bucket_name}/{s3_key}")
            return True
        except ClientError as e:
            logger.error(f"Error uploading file to S3: {e}")
            return False
    
    def upload_fileobj(self, file_obj: BinaryIO, s3_key: str, content_type: Optional[str] = None) -> bool:
        """
        Upload a file-like object to S3.
        
        Args:
            file_obj: File-like object to upload
            s3_key: S3 object key (path in bucket)
            content_type: Optional content type (MIME type)
        
        Returns:
            True if successful, False otherwise
        """
        if not self.s3_client or not self.bucket_name:
            logger.warning("S3 client not initialized. Skipping upload.")
            return False
        
        try:
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
            
            self.s3_client.upload_fileobj(file_obj, self.bucket_name, s3_key, ExtraArgs=extra_args)
            logger.info(f"Successfully uploaded file object to s3://{self.bucket_name}/{s3_key}")
            return True
        except ClientError as e:
            logger.error(f"Error uploading file object to S3: {e}")
            return False
    
    def download_file(self, s3_key: str, file_path: str) -> bool:
        """
        Download a file from S3.
        
        Args:
            s3_key: S3 object key (path in bucket)
            file_path: Local file path to save to
        
        Returns:
            True if successful, False otherwise
        """
        if not self.s3_client or not self.bucket_name:
            logger.warning("S3 client not initialized. Skipping download.")
            return False
        
        try:
            self.s3_client.download_file(self.bucket_name, s3_key, file_path)
            logger.info(f"Successfully downloaded s3://{self.bucket_name}/{s3_key} to {file_path}")
            return True
        except ClientError as e:
            logger.error(f"Error downloading file from S3: {e}")
            return False
    
    def check_bucket_exists(self) -> bool:
        """
        Check if the configured S3 bucket exists.
        
        Returns:
            True if bucket exists, False otherwise
        """
        if not self.s3_client or not self.bucket_name:
            return False
        
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            return True
        except ClientError:
            return False
    
    def create_bucket_if_not_exists(self) -> bool:
        """
        Create the S3 bucket if it doesn't exist.
        
        Returns:
            True if bucket exists or was created, False otherwise
        """
        if not self.s3_client or not self.bucket_name:
            logger.warning("S3 client not initialized. Cannot create bucket.")
            return False
        
        if self.check_bucket_exists():
            logger.info(f"Bucket {self.bucket_name} already exists")
            return True
        
        try:
            self.s3_client.create_bucket(
                Bucket=self.bucket_name,
                CreateBucketConfiguration={'LocationConstraint': config.aws.region}
            )
            logger.info(f"Created S3 bucket: {self.bucket_name}")
            return True
        except ClientError as e:
            logger.error(f"Error creating S3 bucket: {e}")
            return False


# Global S3 client instance
s3_client = S3Client()


