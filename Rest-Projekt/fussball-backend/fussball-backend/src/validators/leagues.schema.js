const Joi = require('joi');
const { paginationBase } = require('./common.schema');

const createLeagueSchema = Joi.object({
    name:    Joi.string().max(100).required(),
    country: Joi.string().max(50).required()
});

const updateLeagueSchema = Joi.object({
    name:    Joi.string().max(100),
    country: Joi.string().max(50)
}).min(1);

const listLeaguesQuerySchema = Joi.object({
    ...paginationBase,
    country: Joi.string().max(50)
});

module.exports = { createLeagueSchema, updateLeagueSchema, listLeaguesQuerySchema };
