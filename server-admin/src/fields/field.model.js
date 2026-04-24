import { Schema, model } from "mongoose";

const fieldSchema = new Schema({ //Formato JSON
    fieldName: {
        type: String,
        required: [true, 'El nombre de la cancha es obligatorio'],
        trim: true,
        max: [100, 'El nombre no puede exceder los caracteres']
    },
    fieldType: {
        type: String,
        required: [true, 'El tipo de superficie es obligatorio'],
        enum: {
            values: ['NATURAL', 'SINTETICA', 'CEMENTO'],
            message: 'El tipo de superficie no es valido'
        }
    },
    capacity: {
        type: String,
        required: [true, 'La capacidad de la cancha es obligatoria'],
        enum: ['FUTBOL_5', 'FUTBOL_7', 'FUTBOL_11'],
        message: 'La capacidad no es válida'
    },
    pricePerHour: {
        type: Number,
        required: [true, 'El precio por hora es obligatorio'],
        min: [0, 'El precio debe ser mayor o igual a 0']
    },
    description: {
        type: String,
        trim: true,
        maxLength: [500, 'La descripción no puede exceder 500 caracteres'],
    },
    photo: {
        type: String,
        default: 'fields/kinal_sports_tax3fw',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
},
    {
        timestamps: true,
        versionKey: false,
    }
);

// Índices para optimizar búsquedas
fieldSchema.index({ isActive: 1 });
fieldSchema.index({ fieldType: 1 });
fieldSchema.index({ isActive: 1, fieldType: 1 });

export default model('Field', fieldSchema);