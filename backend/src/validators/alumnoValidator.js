const Joi = require('joi');

const alumnoSchema = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.base': 'El nombre debe ser texto',
      'string.empty': 'El nombre no puede estar vacío',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede tener más de 100 caracteres',
      'any.required': 'El nombre es obligatorio'
    }),

  apellido_paterno: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.base': 'El apellido paterno debe ser texto',
      'string.empty': 'El apellido paterno no puede estar vacío',
      'string.min': 'El apellido paterno debe tener al menos 2 caracteres',
      'string.max': 'El apellido paterno no puede tener más de 100 caracteres',
      'any.required': 'El apellido paterno es obligatorio'
    }),

  apellido_materno: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.base': 'El apellido materno debe ser texto',
      'string.empty': 'El apellido materno no puede estar vacío',
      'string.min': 'El apellido materno debe tener al menos 2 caracteres',
      'string.max': 'El apellido materno no puede tener más de 100 caracteres',
      'any.required': 'El apellido materno es obligatorio'
    }),

  fecha_de_nacimiento: Joi.date()
    .required()
    .messages({
      'date.base': 'La fecha de nacimiento debe ser una fecha válida',
      'any.required': 'La fecha de nacimiento es obligatoria'
    }),

  sexo: Joi.string()
    .valid('M', 'F')
    .required()
    .messages({
      'any.only': 'El sexo debe ser "M" o "F"',
      'any.required': 'El sexo es obligatorio'
    }),

  curp: Joi.string()
    .length(18)
    .required()
    .messages({
      'string.base': 'La CURP debe ser texto',
      'string.length': 'La CURP debe tener exactamente 18 caracteres',
      'any.required': 'La CURP es obligatoria'
    }),

  idEstado: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'El idEstado debe ser un número',
      'number.integer': 'El idEstado debe ser un número entero',
      'any.required': 'El idEstado es obligatorio'
    }),

  idMunicipio: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'El idMunicipio debe ser un número',
      'number.integer': 'El idMunicipio debe ser un número entero',
      'any.required': 'El idMunicipio es obligatorio'
    }),

  usuario: Joi.string() 
      .required()
      .min(8) 
      .max(8) 
      .pattern(/^[0-9]+$/) 
      .messages({
          'string.base': 'El usuario debe ser una cadena de texto (números)',
          'string.empty': 'El campo usuario no puede estar vacío',
          'string.min': 'El usuario debe tener exactamente 8 dígitos',
          'string.max': 'El usuario debe tener exactamente 8 dígitos',
          'string.pattern.base': 'El usuario solo debe contener números', 
          'any.required': 'El campo usuario es obligatorio'
      }),

  contrasena: Joi.string()
    .required()
      .min(4) 
      .max(4) 
      .pattern(/^[0-9]+$/) 
      .messages({
          'string.base': 'El campo contraseña debe ser una cadena de texto (números)',
          'string.empty': 'El campo contraseña no puede estar vacío',
          'string.min': 'El campo contraseña debe tener exactamente 4 dígitos',
          'string.max': 'El campo contraseña debe tener exactamente 4 dígitos',
          'string.pattern.base': 'El campo contraseña solo debe contener números', 
          'any.required': 'El campo contraseña es obligatorio'
      }),

  correo_electronico: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'El correo electrónico debe ser texto',
      'string.email': 'El correo electrónico debe tener un formato válido',
      'any.required': 'El correo electrónico es obligatorio'
    }),

/* matricula: Joi.string()
    .required()
    .messages({
      'string.base': 'La matrícula debe ser texto',
      'string.empty': 'La matrícula no puede estar vacía',
      'any.required': 'La matrícula es obligatoria'
    }),
    
  semestre_actual: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .required()
    .messages({
      'number.base': 'El semestre actual debe ser un número',
      'number.integer': 'El semestre actual debe ser un número entero',
      'number.min': 'El semestre actual no puede ser menor a 1',
      'number.max': 'El semestre actual no puede ser mayor a 12',
      'any.required': 'El semestre actual es obligatorio'
    }),
*/
  idCarrera: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'El idCarrera debe ser un número',
      'number.integer': 'El idCarrera debe ser un número entero',
      'any.required': 'El idCarrera es obligatorio'
    }),
});

module.exports = alumnoSchema;