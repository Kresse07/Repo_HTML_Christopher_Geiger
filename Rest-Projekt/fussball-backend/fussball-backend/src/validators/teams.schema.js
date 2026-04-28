const Joi = require('joi');
const { paginationBase } = require('./common.schema');

const createTeamSchema = Joi.object({
    name:         Joi.string().max(100).required(),
    short_name:   Joi.string().max(10),
    league_id:    Joi.number().integer().positive().required(),
    stadium_id:   Joi.number().integer().positive(),
    founded_year: Joi.number().integer().min(1800).max(2100)
});

const updateTeamSchema = Joi.object({
    name:         Joi.string().max(100),
    short_name:   Joi.string().max(10).allow(null, ''),
    league_id:    Joi.number().integer().positive(),
    stadium_id:   Joi.number().integer().positive().allow(null),
    founded_year: Joi.number().integer().min(1800).max(2100).allow(null)
}).min(1);

const listTeamsQuerySchema = Joi.object({
    ...paginationBase,
    leagueId:  Joi.number().integer().positive(),
    stadiumId: Joi.number().integer().positive()
});

module.exports = { createTeamSchema, updateTeamSchema, listTeamsQuerySchema };
