const Joi = require('joi');
const { paginationBase } = require('./common.schema');

const createCardSchema = Joi.object({
    match_id:  Joi.number().integer().positive().required(),
    player_id: Joi.number().integer().positive().required(),
    minute:    Joi.number().integer().min(1).max(130).required(),
    card_type: Joi.string().valid('yellow','red').required(),
    reason:    Joi.string().max(255).allow(null, '')
});

const updateCardSchema = Joi.object({
    match_id:  Joi.number().integer().positive(),
    player_id: Joi.number().integer().positive(),
    minute:    Joi.number().integer().min(1).max(130),
    card_type: Joi.string().valid('yellow','red'),
    reason:    Joi.string().max(255).allow(null, '')
}).min(1);

const listCardsQuerySchema = Joi.object({
    ...paginationBase,
    matchId:  Joi.number().integer().positive(),
    playerId: Joi.number().integer().positive(),
    cardType: Joi.string().valid('yellow','red')
});

module.exports = { createCardSchema, updateCardSchema, listCardsQuerySchema };
