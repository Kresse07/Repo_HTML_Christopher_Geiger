const Joi = require('joi');
const { paginationBase } = require('./common.schema');

const createMatchSchema = Joi.object({
    season_id:    Joi.number().integer().positive().required(),
    home_team_id: Joi.number().integer().positive().required(),
    away_team_id: Joi.number().integer().positive().required()
        .disallow(Joi.ref('home_team_id'))
        .messages({ 'any.invalid': 'Heim- und Gastteam müssen unterschiedlich sein.' }),
    stadium_id:   Joi.number().integer().positive().allow(null),
    referee_id:   Joi.number().integer().positive().allow(null),
    match_date:   Joi.date().iso().required(),
    home_score:   Joi.number().integer().min(0).default(0),
    away_score:   Joi.number().integer().min(0).default(0),
    status:       Joi.string().valid('scheduled','live','finished','cancelled').default('scheduled')
});

const updateMatchSchema = Joi.object({
    season_id:    Joi.number().integer().positive(),
    home_team_id: Joi.number().integer().positive(),
    away_team_id: Joi.number().integer().positive(),
    stadium_id:   Joi.number().integer().positive().allow(null),
    referee_id:   Joi.number().integer().positive().allow(null),
    match_date:   Joi.date().iso(),
    home_score:   Joi.number().integer().min(0),
    away_score:   Joi.number().integer().min(0),
    status:       Joi.string().valid('scheduled','live','finished','cancelled')
}).min(1);

const listMatchesQuerySchema = Joi.object({
    ...paginationBase,
    seasonId: Joi.number().integer().positive(),
    teamId:   Joi.number().integer().positive(),    // Heim oder Gast
    status:   Joi.string().valid('scheduled','live','finished','cancelled')
});

module.exports = { createMatchSchema, updateMatchSchema, listMatchesQuerySchema };
