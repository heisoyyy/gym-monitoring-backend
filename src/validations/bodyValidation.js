const Joi = require('joi');

const weightLogSchema = Joi.object({
  weight: Joi.number().positive().min(10).max(500).required(),
});

module.exports = {
  weightLogSchema,
};
