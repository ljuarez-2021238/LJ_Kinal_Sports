import { createFieldRecord, deactivateFieldRecord, getFieldsRecord, updateFieldRecord } from "./field.service.js";

export const getFields = async (_req, res, next) => {
    try {
        const fields = await getFieldsRecord();

        return res.status(200).json({
            success: true,
            message: 'Canchas obtenidas exitosamente',
            data: fields,
        });
    } catch (err) {
        next(err);
    }
}

export const createField = async(req, res, next)=>{
    try{
        const field = await createFieldRecord({
            fieldData: req.body,
            file: req.file
        })
        res.status(201).json({
            success: true,
            message: 'Cancha registrada exitosamente',
            data: field
        })
    }catch(err){
        next(err);
    }
}

export const updateField = async (req, res, next) => {
    try {
        const { id } = req.params;
        const field = await updateFieldRecord({
            id,
            fieldData: req.body,
            file: req.file,
        });

        if (!field) {
            return res.status(404).json({
                success: false,
                message: 'Cancha no encontrada',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Cancha actualizada exitosamente',
            data: field,
        });
    } catch (err) {
        next(err);
    }
}

export const deactivateField = async (req, res, next) => {
    try {
        const { id } = req.params;
        const field = await deactivateFieldRecord(id);

        if (!field) {
            return res.status(404).json({
                success: false,
                message: 'Cancha no encontrada',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Cancha desactivada exitosamente',
            data: field,
        });
    } catch (err) {
        next(err);
    }
};