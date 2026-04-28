const Joi = require('joi');
const { paginationBase } = require('./common.schema');

const createPlayerSchema = Joi.object({
    first_name:    Joi.string().max(50).required(),
    last_name:     Joi.string().max(50).required(),
    birthdate:     Joi.date().iso().less('now').allow(null),
    nationality:   Joi.string().max(50).allow(null, ''),
    team_id:       Joi.number().integer().positive().allow(null),
    position_id:   Joi.number().integer().positive().allow(null),
    jersey_number: Joi.number().integer().min(1).max(99).allow(null)
});

const updatePlayerSchema = Joi.object({
    first_name:    Joi.string().max(50),
    last_name:     Joi.string().max(50),
    birthdate:     Joi.date().iso().less('now').allow(null),
    nationality:   Joi.string().max(50).allow(null, ''),
    team_id:       Joi.number().integer().positive().allow(null),
    position_id:   Joi.number().integer().positive().allow(null),
    jersey_number: Joi.number().integer().min(1).max(99).allow(null)
}).min(1);

const listPlayersQuerySchema = Joi.object({
    ...paginationBase,
    teamId:      Joi.number().integer().positive(),
    positionId:  Joi.number().integer().positive(),
    nationality: Joi.string().max(50)
});

module.exports = { createPlayerSchema, updatePlayerSchema, listPlayersQuerySchema };
