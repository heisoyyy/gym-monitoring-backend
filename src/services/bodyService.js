const userRepository = require('../repositories/userRepository');
const bodyRepository = require('../repositories/bodyRepository');

// Helper untuk menghitung umur berdasarkan tanggal lahir
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Menghitung BMI
const calculateBMI = (weight, height) => {
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
};

// Menentukan status tubuh berdasarkan BMI
const determineBodyStatus = (bmi) => {
  if (bmi < 18.5) return 'UNDERWEIGHT';
  if (bmi >= 18.5 && bmi < 25) return 'NORMAL';
  if (bmi >= 25 && bmi < 30) return 'OVERWEIGHT';
  return 'OBESE';
};

// Menghitung berat badan ideal (berdasarkan BMI ideal 18.5 s/d 24.9)
const calculateIdealWeight = (height) => {
  const heightInMeters = height / 100;
  const minIdeal = parseFloat((18.5 * heightInMeters * heightInMeters).toFixed(1));
  const maxIdeal = parseFloat((24.9 * heightInMeters * heightInMeters).toFixed(1));
  const pointIdeal = parseFloat((21.7 * heightInMeters * heightInMeters).toFixed(1)); // Nilai tengah ideal
  return {
    min: minIdeal,
    max: maxIdeal,
    ideal: pointIdeal,
  };
};

// Menghitung BMR (Mifflin-St Jeor)
const calculateBMR = (weight, height, age, gender) => {
  if (gender === 'MALE') {
    return parseFloat((10 * weight + 6.25 * height - 5 * age + 5).toFixed(1));
  } else {
    return parseFloat((10 * weight + 6.25 * height - 5 * age - 161).toFixed(1));
  }
};

// Menghitung TDEE berdasarkan tingkat aktivitas
const calculateTDEE = (bmr, activityLevel) => {
  const multipliers = {
    SEDENTARY: 1.2,
    LIGHTLY_ACTIVE: 1.375,
    MODERATELY_ACTIVE: 1.55,
    VERY_ACTIVE: 1.725,
    EXTRA_ACTIVE: 1.9,
  };
  const multiplier = multipliers[activityLevel] || 1.2;
  return parseFloat((bmr * multiplier).toFixed(1));
};

const updateProfile = async (userId, data) => {
  const { height, weight, dateOfBirth, gender, targetFitness, activityLevel } = data;
  
  const age = calculateAge(dateOfBirth);
  const bmi = calculateBMI(weight, height);
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const status = determineBodyStatus(bmi);

  // 1. Simpan/Upsert profile user
  const profile = await userRepository.upsertUserProfile(userId, {
    height,
    weight,
    dateOfBirth,
    gender,
    targetFitness,
    activityLevel,
    bmi,
    bmr,
    tdee,
  });

  // 2. Catat ke riwayat perkembangan tubuh
  await bodyRepository.createBodyHistory(userId, {
    weight,
    bmi,
    status,
  });

  const idealWeight = calculateIdealWeight(height);

  return {
    profile,
    bmi,
    status,
    bmr,
    tdee,
    idealWeight,
  };
};

const getUserProfileDetails = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user || !user.profile) {
    return null;
  }

  const { height, weight, dateOfBirth, gender, activityLevel } = user.profile;
  const age = calculateAge(dateOfBirth);
  const bmi = calculateBMI(weight, height);
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const status = determineBodyStatus(bmi);
  const idealWeight = calculateIdealWeight(height);

  return {
    profile: user.profile,
    age,
    bmi,
    status,
    bmr,
    tdee,
    idealWeight,
  };
};

const getBodyHistory = async (userId) => {
  return bodyRepository.getBodyHistoryByUserId(userId);
};

const logWeightOnly = async (userId, weight) => {
  const details = await getUserProfileDetails(userId);
  if (!details) {
    throw new Error('User profile not found. Please complete profile first.');
  }

  const height = details.profile.height;
  const bmi = calculateBMI(weight, height);
  const status = determineBodyStatus(bmi);

  // Update berat badan di profil
  await userRepository.upsertUserProfile(userId, {
    ...details.profile,
    weight,
    bmi,
  });

  // Catat riwayat
  const log = await bodyRepository.createBodyHistory(userId, {
    weight,
    bmi,
    status,
  });

  return log;
};

module.exports = {
  updateProfile,
  getUserProfileDetails,
  getBodyHistory,
  logWeightOnly,
  calculateBMI,
  determineBodyStatus,
};
