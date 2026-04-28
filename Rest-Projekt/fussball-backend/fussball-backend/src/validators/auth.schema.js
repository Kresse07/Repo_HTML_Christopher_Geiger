// =========================================================================
//  JOI-SCHEMAS für Authentifizierung
//  H6: JSON-Schema-Validator
//
//  Diese Schemas definieren genau, was ein gültiger Request-Body sein darf.
//  Joi-Vorteile hier sichtbar:
//    - Typ-Prüfung (string, email, min/max-Länge)
//    - Mehrere Fehler auf einmal zurückmelden
//    - Klare Fehlermeldungen auf Deutsch
// =========================================================================

const Joi = require('joi');

/**
 * Schema für POST /api/auth/register
 */
const registerSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(50)
        .required()
        .messages({
            'string.alphanum': 'Der Benutzername darf nur Buchstaben und Zahlen enthalten.',
            'string.min': 'Der Benutzername muss mindestens 3 Zeichen lang sein.',
            'string.max': 'Der Benutzername darf maximal 50 Zeichen lang sein.',
            'any.required': 'Der Benutzername ist erforderlich.'
        }),

    email: Joi.string()
        .email()
        .max(100)
        .required()
        .messages({
            'string.email': 'Die E-Mail-Adresse ist ungültig.',
            'any.required': 'Die E-Mail-Adresse ist erforderlich.'
        }),

    password: Joi.string()
        .min(6)
        .max(100)
        .required()
        .messages({
            'string.min': 'Das Passwort muss mindestens 6 Zeichen lang sein.',
            'any.required': 'Das Passwort ist erforderlich.'
        })
});

/**
 * Schema für POST /api/auth/login
 */
const loginSchema = Joi.object({
    username: Joi.string()
        .required()
        .messages({
            'any.required': 'Der Benutzername ist erforderlich.'
        }),

    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Das Passwort ist erforderlich.'
        })
});

module.exports = { registerSchema, loginSchema };
