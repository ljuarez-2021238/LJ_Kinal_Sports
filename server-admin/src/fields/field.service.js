import Field from './field.model.js'

export const getFieldsRecord = async () => {
    return await Field.find({ isActive: true }).sort({ createdAt: -1 }).lean();
}

export const deactivateFieldRecord = async (id) => {
    return await Field.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    ).lean();
}

export const createFieldRecord = async ({fieldData, file})=>{
    const data = {...fieldData}

    // Compatibilidad: aceptar CONCRETO y persistir como CEMENTO
    if (data.fieldType === 'CONCRETO') {
        data.fieldType = 'CEMENTO';
    }

    if(file){
        data.photo = file.path || file.secure_url || file.url || file.filename || file.public_id || 'fields/kinal_sports_tax3fw';
    }else{
        data.photo = 'fields/kinal_sports_tax3fw'
    }//if else

        const field = new Field(data);
        await field.save();
        return field;
}

export const updateFieldRecord = async ({ id, fieldData, file }) => {
    const data = { ...fieldData };

    // Compatibilidad: aceptar CONCRETO y persistir como CEMENTO
    if (data.fieldType === 'CONCRETO') {
        data.fieldType = 'CEMENTO';
    }

    if (file) {
        data.photo = file.path || file.secure_url || file.url || file.filename || file.public_id;
    }

    return await Field.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    }).lean();
}