// =========================================================================
//  GEMEINSAME JOI-SCHEMAS
//  H6: Werden in allen Entitäten wiederverwendet.
// =========================================================================

const Joi = require('joi');

/**
 * Validiert :id-Parameter in der URL (z.B. /api/teams/:id).
 * Stellt sicher, dass :id eine positive Ganzzahl ist.
 */
const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required()
        .messages({
            'number.base':    'Die ID muss eine Zahl sein.',
            'number.integer': 'Die ID muss ganzzahlig sein.',
            'number.positive':'Die ID muss positiv sein.'
        })
});

/**
 * Basis-Schema für Query-Parameter mit Pagination (H1: req.query).
 * Wird pro Entität mit .keys({...}) um Filter erweitert.
 */
const paginationBase = {
    page:  Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
};

module.exports = { idParamSchema, paginationBase };
