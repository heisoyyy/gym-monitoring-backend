const workoutRepository = require('../repositories/workoutRepository');
const bodyService = require('./bodyService');

// --- JADWAL LATIHAN MINGGUAN (SCHEDULES) ---

const getSchedules = async (userId) => {
  return workoutRepository.getSchedulesByUserId(userId);
};

const saveSchedule = async (userId, dayOfWeek, title) => {
  // dayOfWeek: 0 (Minggu) sampai 6 (Sabtu)
  if (dayOfWeek < 0 || dayOfWeek > 6) {
    throw new Error('Hari tidak valid. Harus bernilai 0 (Minggu) hingga 6 (Sabtu).');
  }
  return workoutRepository.upsertSchedule(userId, dayOfWeek, title);
};

// --- SESI LATIHAN & ABSENSI HARIAN (SESSIONS) ---

const getSessions = async (userId) => {
  return workoutRepository.getSessionsByUserId(userId);
};

const getOrCreateSessionByDate = async (userId, dateStr) => {
  const targetDate = new Date(dateStr);
  
  // Cari apakah sesi sudah tercatat di database
  let session = await workoutRepository.findWorkoutSessionByDate(userId, targetDate);
  
  if (!session) {
    // Jika belum ada, cari jadwal mingguan untuk hari tersebut (dayOfWeek)
    const dayOfWeek = targetDate.getDay(); // 0-6
    const schedules = await workoutRepository.getSchedulesByUserId(userId);
    const daySchedule = schedules.find(s => s.dayOfWeek === dayOfWeek);
    
    // Tentukan judul sesi default
    const title = daySchedule ? daySchedule.title : 'Rest Day';
    const initialStatus = daySchedule ? 'PLANNED' : 'REST_DAY';

    // Buat sesi default baru
    session = await workoutRepository.createWorkoutSession(userId, {
      date: targetDate,
      status: initialStatus,
      bodyWeight: null,
      missedReason: null,
    });
  }
  
  return session;
};

const recordSessionAttendance = async (userId, sessionId, attendanceData) => {
  const { status, bodyWeight, missedReason } = attendanceData;
  
  // Validasi status
  if (!['COMPLETED', 'REST_DAY', 'MISSED', 'PLANNED'].includes(status)) {
    throw new Error('Status latihan tidak valid.');
  }

  // Ambil data sesi saat ini
  const currentSession = await workoutRepository.findWorkoutSessionById(sessionId);
  if (!currentSession) {
    throw new Error('Sesi latihan tidak ditemukan.');
  }

  // Jika menyertakan data Berat Badan (BB) harian, sinkronisasikan ke riwayat BB utama
  if (bodyWeight && parseFloat(bodyWeight) > 0) {
    try {
      await bodyService.logWeightOnly(userId, parseFloat(bodyWeight));
    } catch (err) {
      console.error('Gagal memperbarui BB harian dari absensi latihan:', err.message);
    }
  }

  // Update data sesi
  const updatedSession = await workoutRepository.updateWorkoutSession(sessionId, {
    status,
    bodyWeight: bodyWeight ? parseFloat(bodyWeight) : null,
    missedReason: status === 'MISSED' ? missedReason : null,
  });

  return updatedSession;
};

// --- PENCATATAN GERAKAN LATIHAN (EXERCISES LOG) ---

const logExerciseToSession = async (sessionId, exerciseLogData) => {
  // exerciseLogData: { exerciseId, sets, reps, weight }
  const { exerciseId, sets, reps, weight } = exerciseLogData;
  
  return workoutRepository.addWorkoutExercise(sessionId, {
    exerciseId: parseInt(exerciseId),
    sets: parseInt(sets),
    reps: parseInt(reps),
    weight: parseFloat(weight),
    completed: false, // Default belum dicentang selesai
  });
};

const updateExerciseLog = async (workoutExerciseId, updateData) => {
  // updateData: { sets, reps, weight, completed }
  return workoutRepository.updateWorkoutExercise(workoutExerciseId, {
    sets: updateData.sets ? parseInt(updateData.sets) : undefined,
    reps: updateData.reps ? parseInt(updateData.reps) : undefined,
    weight: updateData.weight ? parseFloat(updateData.weight) : undefined,
    completed: updateData.completed,
  });
};

const removeExerciseFromSession = async (workoutExerciseId) => {
  return workoutRepository.deleteWorkoutExercise(workoutExerciseId);
};

module.exports = {
  getSchedules,
  saveSchedule,
  getSessions,
  getOrCreateSessionByDate,
  recordSessionAttendance,
  logExerciseToSession,
  updateExerciseLog,
  removeExerciseFromSession,
};
