const prisma = require('../config/prisma');

// --- WORKOUT SCHEDULES ---

const getSchedulesByUserId = async (userId) => {
  return prisma.workoutSchedule.findMany({
    where: { userId },
    orderBy: { dayOfWeek: 'asc' },
  });
};

const upsertSchedule = async (userId, dayOfWeek, title) => {
  // Mencari jika jadwal hari tersebut sudah ada
  const existing = await prisma.workoutSchedule.findFirst({
    where: { userId, dayOfWeek },
  });

  if (existing) {
    return prisma.workoutSchedule.update({
      where: { id: existing.id },
      data: { title },
    });
  } else {
    return prisma.workoutSchedule.create({
      data: {
        userId,
        dayOfWeek,
        title,
      },
    });
  }
};

const deleteSchedule = async (scheduleId) => {
  return prisma.workoutSchedule.delete({
    where: { id: scheduleId },
  });
};

// --- WORKOUT SESSIONS ---

const getSessionsByUserId = async (userId) => {
  return prisma.workoutSession.findMany({
    where: { userId },
    include: {
      schedule: true,
      exercises: {
        include: {
          exercise: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  });
};

const findWorkoutSessionById = async (sessionId) => {
  return prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
      },
    },
  });
};

const findWorkoutSessionByDate = async (userId, date) => {
  // Dapatkan awal hari dan akhir hari untuk pencarian tanggal presisi
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.workoutSession.findFirst({
    where: {
      userId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
      },
    },
  });
};

const createWorkoutSession = async (userId, sessionData) => {
  return prisma.workoutSession.create({
    data: {
      userId,
      scheduleId: sessionData.scheduleId || null,
      date: new Date(sessionData.date),
      status: sessionData.status || 'PLANNED',
      bodyWeight: sessionData.bodyWeight || null,
      missedReason: sessionData.missedReason || null,
    },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
      },
    },
  });
};

const updateWorkoutSession = async (sessionId, updateData) => {
  return prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      status: updateData.status,
      bodyWeight: updateData.bodyWeight !== undefined ? updateData.bodyWeight : undefined,
      missedReason: updateData.missedReason !== undefined ? updateData.missedReason : null,
    },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
      },
    },
  });
};

// --- WORKOUT EXERCISES ---

const addWorkoutExercise = async (sessionId, exerciseData) => {
  return prisma.workoutExercise.create({
    data: {
      sessionId,
      exerciseId: exerciseData.exerciseId,
      sets: exerciseData.sets,
      reps: exerciseData.reps,
      weight: exerciseData.weight,
      completed: exerciseData.completed || false,
    },
    include: {
      exercise: true,
    },
  });
};

const updateWorkoutExercise = async (workoutExerciseId, updateData) => {
  return prisma.workoutExercise.update({
    where: { id: workoutExerciseId },
    data: {
      sets: updateData.sets,
      reps: updateData.reps,
      weight: updateData.weight,
      completed: updateData.completed !== undefined ? updateData.completed : undefined,
    },
  });
};

const deleteWorkoutExercise = async (workoutExerciseId) => {
  return prisma.workoutExercise.delete({
    where: { id: workoutExerciseId },
  });
};

module.exports = {
  getSchedulesByUserId,
  upsertSchedule,
  deleteSchedule,
  getSessionsByUserId,
  findWorkoutSessionById,
  findWorkoutSessionByDate,
  createWorkoutSession,
  updateWorkoutSession,
  addWorkoutExercise,
  updateWorkoutExercise,
  deleteWorkoutExercise,
};
