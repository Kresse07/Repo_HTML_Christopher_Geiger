const Joi = require('joi');
const { paginationBase } = require('./common.schema');

const createPositionSchema = Joi.object({
    name: Joi.string().max(50).required(),
    short_code: Joi.string().max(5).required()
});

const updatePositionSchema = Joi.object({
    name: Joi.string().max(50),
    short_code: Joi.string().max(5)
}).min(1);  // mindestens ein Feld muss da sein

const listPositionsQuerySchema = Joi.object({ ...paginationBase });

module.exports = { createPositionSchema, updatePositionSchema, listPositionsQuerySchema };
