const Joi = require('joi');
const { paginationBase } = require('./common.schema');

const createGoalSchema = Joi.object({
    match_id:    Joi.number().integer().positive().required(),
    player_id:   Joi.number().integer().positive().required(),
    minute:      Joi.number().integer().min(1).max(130).required(),
    is_penalty:  Joi.boolean().default(false),
    is_own_goal: Joi.boolean().default(false)
});

const updateGoalSchema = Joi.object({
    match_id:    Joi.number().integer().positive(),
    player_id:   Joi.number().integer().positive(),
    minute:      Joi.number().integer().min(1).max(130),
    is_penalty:  Joi.boolean(),
    is_own_goal: Joi.boolean()
}).min(1);

const listGoalsQuerySchema = Joi.object({
    ...paginationBase,
    matchId:  Joi.number().integer().positive(),
    playerId: Joi.number().integer().positive()
});

module.exports = { createGoalSchema, updateGoalSchema, listGoalsQuerySchema };
