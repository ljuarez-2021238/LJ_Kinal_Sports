import {Router} from 'express';
import {createField, deactivateField, getFields, updateField} from './field.controller.js';
import {validateCreateField } from '../../middlewares/field-validator.js';
import {uploadFieldImage} from '../../middlewares/file-uploader.js';
import {cleanupUploadedFileOnFinish} from '../../middlewares/delete-file-on-error.js';

const router = Router();
router.get('/', getFields);
router.post(
    '/',
    uploadFieldImage.single('photo'),
    cleanupUploadedFileOnFinish,
    validateCreateField,
    createField
);
router.put(
    '/:id',
    uploadFieldImage.single('photo'),
    cleanupUploadedFileOnFinish,
    validateCreateField,
    updateField
);
router.put('/:id/deactivate', deactivateField);

export default router;