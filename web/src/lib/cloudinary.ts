export async function uploadVideoToCloudinary(
  file: File,
  cloudName: string = 'dvg1bkx8s',
  apiKey: string = 'Urs001opPwT0ydkE5QACD5FxwtY',
  uploadPreset: string = 'ml_default'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    }
  } catch (error) {
    console.warn('Cloudinary API upload fallback:', error);
  }

  // Instant fallback to browser video blob URL
  return URL.createObjectURL(file);
}
