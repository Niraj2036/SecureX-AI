import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          allowed_formats: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'xlsx', 'csv', 'txt'],
          max_file_size: 10 * 1024 * 1024, // 10MB
        },
        (error, result: UploadApiResponse) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject({
              message: error.message || 'Cloudinary upload failed',
              status: 400,
            });
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        },
      );
      uploadStream.on('error', (error) => {
        console.error('Cloudinary stream error:', error);
        reject({
          message: 'Upload stream error: ' + error.message,
          status: 400,
        });
      });
      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
