import multer from "multer";
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

dotenv.config();

const normalizeEnv = (value) =>
    typeof value === 'string' ? value.trim().replace(/^['\"]|['\"]$/g, '') : value;

const cloudName = normalizeEnv(process.env.CLOUDINARY_CLOUD_NAME);
const apiKey = normalizeEnv(process.env.CLOUDINARY_API_KEY);
const apiSecret = normalizeEnv(process.env.CLOUDINARY_API_SECRET);

if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Faltan variables de entorno de Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).');
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

const MIMETYPES = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const createCloudinaryUploader = (folder) => {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: (req, file) => {
            const fileExt = extname(file.originalname);
            const baseName = file.originalname.replace(fileExt, '');
            const safeBase = baseName
            .toLowerCase()
            .replace(/[^a-z0-9]+/gi, '-') //Remplazar caracteres no alfanumericos por guiones
            .replace(/^-+|-+$/g, '');

            const shortUuid = uuidv4().substring(0,8);
            const publicId = `${safeBase}-${shortUuid}`;

            return {
                folder: folder,
                publicId: publicId,
                allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                transformation:[{width: 1000, height: 1000, crop: 'limit'}],
                resource_type: 'image'
            }
        }      
    });

    return multer({
        storage: storage,
        fileFilter: (req, file, cb) => {
            if (MIMETYPES.includes(file.mimetype)){
                cb(null, true);
            } else {
                cb(new Error(`Solo se permiten imágenes: ${MIMETYPES.join(', ')}`));
            }
        },
        limits:{
            fileSize: MAX_FILE_SIZE,
        },
    });
};

export const uploadFieldImage = createCloudinaryUploader(
    'kinal_sports_in6am/fields'
);

export const uploadTeamImage = createCloudinaryUploader(
    'kinal_sports_in6am/teams'
);

export { cloudinary };