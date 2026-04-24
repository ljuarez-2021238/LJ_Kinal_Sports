'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions} from './cors.configuration.js';
import { helmetOptions } from './helmet.configuration.js';
import { dbConnection } from './db.configuration.js';
import { requestLimit } from './rateLimit.configuration.js';
import { errorHandler } from '../middlewares/handle-errors.js';
import fieldRoutes from '../src/fields/field.routes.js';

const BASE_PATH = '/kinalSportsAdmin/v1';

const routes = (app) =>{
    app.use(`${BASE_PATH}/fields`, fieldRoutes);
    app.get(`${BASE_PATH}/health`, (req, res) =>{
        res.status(200).json({
            status : 'Healthy',
            timeStamp : new Date().toISOString(),
            service: 'Kinal Sports Admin Server'
        });
    })

    app.use((req, res) =>{
        res.status(404).json({
            success : false,
            message: 'Enpoint no encontrado'
        })
    })
}

//Middlewares globales
const middlewares = (app)=>{
    app.use(express.json({limit: '10mb'}));
    app.use(express.urlencoded({extended: false, limit: '10mb'}));
    app.use(cors(corsOptions));
    app.use(helmet(helmetOptions));
    app.use(morgan('dev'));
    app.use(requestLimit)
}

export const initServer = async ()=>{
    const app = express();
    const PORT = process.env.PORT;
    app.set('trust proxy', 1)//Servicio para el tercer bim

    try{
        middlewares(app);
        await dbConnection();
        routes(app);
        app.use(errorHandler);
        app.listen(PORT, ()=> {
            console.log(`Server running on port ${PORT}`);
            console.log(`Health check endpoint: http://localhost:${PORT}${BASE_PATH}/health`);
        });
    }catch(err){
        console.error(`Kinal Sports - Error al iniciar el servidor: ${err.message}`);
        process.exit(1);
    }//try-catch para conectarse el servidor
}//initserver Cuando no me tire el puerto, debo de poner un operador || y asignar manualmente el número del puerto