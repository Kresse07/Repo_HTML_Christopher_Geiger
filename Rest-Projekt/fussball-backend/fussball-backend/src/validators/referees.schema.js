const Joi = require('joi');
const { paginationBase } = require('./common.schema');

const createRefereeSchema = Joi.object({
    first_name:  Joi.string().max(50).required(),
    last_name:   Joi.string().max(50).required(),
    nationality: Joi.string().max(50).required()
});

const updateRefereeSchema = Joi.object({
    first_name:  Joi.string().max(50),
    last_name:   Joi.string().max(50),
    nationality: Joi.string().max(50)
}).min(1);

const listRefereesQuerySchema = Joi.object({
    ...paginationBase,
    nationality: Joi.string().max(50)
});

module.exports = { createRefereeSchema, updateRefereeSchema, listRefereesQuerySchema };
