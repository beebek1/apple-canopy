import { v2 as cloudinary } from "cloudinary";

export function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
): Promise<{ secureUrl: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => {
        if (err || !result)
          return reject(err ?? new Error("Cloudinary upload failed"));
        resolve({ secureUrl: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}
