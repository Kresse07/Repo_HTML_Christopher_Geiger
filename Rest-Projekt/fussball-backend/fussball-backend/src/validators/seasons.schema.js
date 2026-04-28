const Joi = require('joi');
const { paginationBase } = require('./common.schema');

const createSeasonSchema = Joi.object({
    league_id:  Joi.number().integer().positive().required(),
    year_start: Joi.number().integer().min(1900).max(2100).required(),
    year_end:   Joi.number().integer().min(1900).max(2100).required(),
    is_active:  Joi.boolean().default(false)
}).custom((value, helpers) => {
    if (value.year_end < value.year_start) {
        return helpers.error('any.custom', { message: 'year_end muss >= year_start sein.' });
    }
    return value;
});

const updateSeasonSchema = Joi.object({
    league_id:  Joi.number().integer().positive(),
    year_start: Joi.number().integer().min(1900).max(2100),
    year_end:   Joi.number().integer().min(1900).max(2100),
    is_active:  Joi.boolean()
}).min(1);

const listSeasonsQuerySchema = Joi.object({
    ...paginationBase,
    leagueId: Joi.number().integer().positive(),
    active:   Joi.boolean()
});

module.exports = { createSeasonSchema, updateSeasonSchema, listSeasonsQuerySchema };
