const Joi = require('joi');

const profileSchema = Joi.object({
  height: Joi.number().positive().min(50).max(300).required(),
  weight: Joi.number().positive().min(10).max(500).required(),
  dateOfBirth: Joi.date().iso().required(),
  gender: Joi.string().valid('MALE', 'FEMALE').required(),
  targetFitness: Joi.string().valid('CUTTING', 'BULKING', 'MAINTAIN').required(),
  activityLevel: Joi.string().valid('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTRA_ACTIVE').required(),
});

module.exports = {
  profileSchema,
};
