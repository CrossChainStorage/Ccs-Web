/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unused-vars */
// import winston, { format, transports } from 'winston';

// eslint-disable-next-line @typescript-eslint/no-var-requires
var winston = require('winston');

var logger = winston.createLogger({
    levels: winston.config.npm.levels,
    format: winston.format.json(),
    transports: [new winston.transports.Console({ format: winston.format.simple() })],
});
// const logger = createLogger({
//     level: winston.config.npm.levels,
//     format: format.combine(
//         format.timestamp({
//             format: 'YYYY-MM-DD HH:mm:ss',
//         }),
//         format.colorize(),
//         format.errors({ stack: true }),
//         format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
//     ),
//     transports: [new transports.Console()],
// });

export default logger;
