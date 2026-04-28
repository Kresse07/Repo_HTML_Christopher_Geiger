const Joi = require('joi');
const { paginationBase } = require('./common.schema');

const createStadiumSchema = Joi.object({
    name:     Joi.string().max(100).required(),
    city:     Joi.string().max(50).required(),
    capacity: Joi.number().integer().min(0).required(),
    country:  Joi.string().max(50)
});

const updateStadiumSchema = Joi.object({
    name:     Joi.string().max(100),
    city:     Joi.string().max(50),
    capacity: Joi.number().integer().min(0),
    country:  Joi.string().max(50)
}).min(1);

const listStadiumsQuerySchema = Joi.object({
    ...paginationBase,
    city:    Joi.string().max(50),
    country: Joi.string().max(50)
});

module.exports = { createStadiumSchema, updateStadiumSchema, listStadiumsQuerySchema };
