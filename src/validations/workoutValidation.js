const Joi = require('joi');

const scheduleSchema = Joi.object({
  dayOfWeek: Joi.number().integer().min(0).max(6).required(),
  title: Joi.string().min(2).max(100).required(),
});

const sessionAttendanceSchema = Joi.object({
  status: Joi.string().valid('PLANNED', 'COMPLETED', 'REST_DAY', 'MISSED').required(),
  bodyWeight: Joi.number().positive().allow(null, '').optional(),
  missedReason: Joi.string().valid('Sakit', 'Sibuk', 'Malas', 'Liburan', 'Lainnya').allow(null, '').optional(),
});

const getOrCreateSessionSchema = Joi.object({
  date: Joi.date().iso().required(),
});

const logExerciseSchema = Joi.object({
  exerciseId: Joi.number().integer().required(),
  sets: Joi.number().integer().min(1).max(20).required(),
  reps: Joi.number().integer().min(1).max(100).required(),
  weight: Joi.number().min(0).max(1000).required(),
});

const updateExerciseLogSchema = Joi.object({
  sets: Joi.number().integer().min(1).max(20).optional(),
  reps: Joi.number().integer().min(1).max(100).optional(),
  weight: Joi.number().min(0).max(1000).optional(),
  completed: Joi.boolean().optional(),
});

module.exports = {
  scheduleSchema,
  sessionAttendanceSchema,
  getOrCreateSessionSchema,
  logExerciseSchema,
  updateExerciseLogSchema,
};
