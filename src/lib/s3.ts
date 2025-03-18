import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { customAlphabet } from 'nanoid';
import path from 'path';

const nanoid = customAlphabet('1234567890abcdef', 10);

const s3 =new S3Client({
  region: "us-east-1",
  endpoint: "https://g8p6.ldn.idrivee2-22.com",
  credentials: {
    accessKeyId: process.env.IDRIVE_ACCESS_KEY!,
    secretAccessKey: process.env.IDRIVE_SECRET_KEY!,
  },
  forcePathStyle: true // IDrive e2 için gerekli
});

export async function uploadFile(buffer: Buffer, key: string, contentType: string): Promise<any> {
  try {
    
    
    const uploadParams = {
      Bucket: process.env.IDRIVE_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    };

    

        // Dosyayı yükle
        await s3.send(new PutObjectCommand(uploadParams));

        // Dosya URL'ini oluştur
        const fileUrl = `https://${process.env.IDRIVE_BUCKET_NAME}.g8p6.ldn.idrivee2-22.com/${key}`;
        const result = {
          originalName: (buffer as any)?.title || key,
          fileName: nanoid(),
          fileType: contentType,
          fileSize: (buffer as any)?.size,
          url: fileUrl,
          key: key
        };

        return result;
  } catch (error) {
    //console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file');
  }
} 