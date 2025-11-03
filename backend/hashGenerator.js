const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const newAdminPassword = '1234'; 

bcrypt.hash(newAdminPassword, SALT_ROUNDS)
    .then(hash => {
        console.log('----------------------------------------------------');
        console.log('HASH GENERADO (CÓPIALO COMPLETO):');
        console.log(hash); 
        console.log('----------------------------------------------------');
        console.log('Nueva Contraseña: ' + newAdminPassword);
        console.log('----------------------------------------------------');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error al generar hash:', err);
        process.exit(1);
    });