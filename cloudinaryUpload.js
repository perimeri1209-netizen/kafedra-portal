const CLOUD_NAME = 'dob8ijt8u';
const UPLOAD_PRESET = 'kafedra-portal';

export const allowedDocumentTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-zip-compressed'
];

export const isImageFile = (file) => {
  return Boolean(file?.type?.startsWith('image/'));
};

export const isPdfFile = (file) => {
  return file?.type === 'application/pdf';
};

export const isAllowedDocumentFile = (file) => {
  if (!file) return false;

  return allowedDocumentTypes.includes(file.type) || isImageFile(file);
};

export const getCloudinaryResourceType = (file) => {
  if (isImageFile(file)) return 'image';
  if (file?.type?.startsWith('video/')) return 'video';

  return 'raw';
};

export const uploadFileToCloudinary = async (file) => {
  if (!file) {
    throw new Error('Файл тандалган жок');
  }

  if (!isAllowedDocumentFile(file)) {
    throw new Error('PDF, Word, Excel, PowerPoint, ZIP же сүрөт файл гана жүктөңүз');
  }

  const resourceType = getCloudinaryResourceType(file);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.log('Cloudinary error:', data);
    throw new Error(data?.error?.message || 'Файл Cloudinary’ге жүктөлгөн жок');
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    name: file.name,
    type: file.type,
    size: file.size,
    resourceType,
    uploadedAt: Date.now()
  };
};

export const uploadMultipleFilesToCloudinary = async (files = []) => {
  const fileList = Array.from(files);
  const uploadedFiles = [];

  for (const file of fileList) {
    const uploaded = await uploadFileToCloudinary(file);
    uploadedFiles.push(uploaded);
  }

  return uploadedFiles;
};