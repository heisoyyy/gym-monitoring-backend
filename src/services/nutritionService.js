const nutritionRepository = require('../repositories/nutritionRepository');
const userRepository = require('../repositories/userRepository');
const bodyService = require('./bodyService');

// Menghitung anjuran nutrisi harian
const calculateDailyNutritionPlan = async (userId) => {
  const profileDetails = await bodyService.getUserProfileDetails(userId);
  if (!profileDetails) {
    throw new Error('Profil pengguna belum lengkap. Silakan lengkapi profil terlebih dahulu.');
  }

  const { weight, targetFitness, tdee } = profileDetails.profile;
  let dailyCalories = 0;
  let protein = 0; // gram
  let fat = 0;     // gram
  let carbs = 0;   // gram

  switch (targetFitness) {
    case 'BULKING':
      dailyCalories = Math.round(tdee + 500);
      protein = Math.round(weight * 2.0); // 2g per kg BB
      fat = Math.round((dailyCalories * 0.25) / 9); // 25% kalori dari lemak
      carbs = Math.round((dailyCalories - (protein * 4) - (fat * 9)) / 4); // Sisa kalori untuk karbohidrat
      break;

    case 'CUTTING':
      dailyCalories = Math.round(tdee - 500);
      // Cegah kalori terlalu rendah (minimum sehat 1200 kcal)
      if (dailyCalories < 1200) dailyCalories = 1200;
      protein = Math.round(weight * 2.2); // 2.2g per kg BB untuk menjaga otot
      fat = Math.round((dailyCalories * 0.20) / 9); // 20% kalori dari lemak
      carbs = Math.round((dailyCalories - (protein * 4) - (fat * 9)) / 4);
      break;

    case 'MAINTAIN':
    default:
      dailyCalories = Math.round(tdee);
      protein = Math.round(weight * 1.8); // 1.8g per kg BB
      fat = Math.round((dailyCalories * 0.25) / 9); // 25% kalori dari lemak
      carbs = Math.round((dailyCalories - (protein * 4) - (fat * 9)) / 4);
      break;
  }

  // Jika karbohidrat menjadi negatif akibat perhitungan protein sangat tinggi, lakukan balancing
  if (carbs < 20) {
    carbs = 50; // Minimum karbohidrat
    // Sesuaikan lemak agar total kalori pas
    const remainingCalories = dailyCalories - (protein * 4) - (carbs * 4);
    fat = Math.max(10, Math.round(remainingCalories / 9));
  }

  const plan = await nutritionRepository.upsertNutritionPlan(userId, {
    dailyCalories,
    protein,
    carbs,
    fat,
  });

  return plan;
};

const getNutritionPlan = async (userId) => {
  let plan = await nutritionRepository.getNutritionPlanByUserId(userId);
  if (!plan) {
    // Coba kalkulasi jika profil user sudah ada
    try {
      plan = await calculateDailyNutritionPlan(userId);
    } catch (error) {
      // Jika profil belum diisi, kembalikan default kosong atau null
      return null;
    }
  }
  return plan;
};

// Rekomendasi Menu Makanan
const getMealRecommendations = (targetFitness) => {
  const recommendations = {
    BULKING: {
      goalDescription: 'Fokus pada surplus kalori bersih tinggi protein untuk membangun massa otot secara optimal.',
      meals: [
        {
          time: 'Sarapan (07:00 - 08:30)',
          menu: 'Oatmeal (100g) + 1 Pisang + 2 sdm Mentega Kacang + 3 Telur Rebus (2 putihnya saja, 1 utuh) + 1 gelas Susu Sapi/Susu Protein.',
          estCalories: 750,
          macros: { protein: 45, carbs: 90, fat: 22 }
        },
        {
          time: 'Makan Siang (12:00 - 13:30)',
          menu: 'Nasi Putih/Merah (200g) + Dada Ayam Panggang/Goreng Udara (150g) + Tempe Bacem (2 potong) + Tumis Sayur Brokoli dan Wortel.',
          estCalories: 850,
          macros: { protein: 50, carbs: 110, fat: 18 }
        },
        {
          time: 'Camilan Sore / Pre-Workout (16:00 - 17:00)',
          menu: 'Roti Gandum (2 lembar) dengan Alpukat halus dan Telur ceplok (1 butir) + Pisang.',
          estCalories: 450,
          macros: { protein: 18, carbs: 55, fat: 16 }
        },
        {
          time: 'Makan Malam (19:00 - 20:30)',
          menu: 'Nasi Putih (150g) + Ikan Kembung/Salmon Panggang (150g) + Tahu Sutra + Sup Bayam.',
          estCalories: 650,
          macros: { protein: 40, carbs: 70, fat: 20 }
        }
      ]
    },
    CUTTING: {
      goalDescription: 'Fokus pada defisit kalori moderat dengan protein ekstra tinggi untuk membakar lemak sekaligus mempertahankan massa otot.',
      meals: [
        {
          time: 'Sarapan (07:00 - 08:30)',
          menu: 'Telur Orak-Arik (3 Putih Telur, 1 Telur Utuh) + Roti Gandum Panggang (1 lembar) + Tomat Ceri + Kopi Hitam/Teh Hijau tanpa gula.',
          estCalories: 320,
          macros: { protein: 28, carbs: 22, fat: 10 }
        },
        {
          time: 'Makan Siang (12:00 - 13:30)',
          menu: 'Nasi Merah (100g) + Dada Ayam Kukus/Panggang tanpa kulit (150g) + Tahu Kukus (1 potong) + Salad Sayuran Hijau (Saus Jeruk Nipis/sedikit Zaitun).',
          estCalories: 480,
          macros: { protein: 45, carbs: 45, fat: 8 }
        },
        {
          time: 'Camilan Sore / Pre-Workout (16:00 - 17:00)',
          menu: 'Greek Yogurt Rendah Lemak (150g) + Segenggam Buah Beri (Stroberi/Bluberi) + 10 butir Kacang Almond.',
          estCalories: 230,
          macros: { protein: 17, carbs: 18, fat: 9 }
        },
        {
          time: 'Makan Malam (19:00 - 20:30)',
          menu: 'Ikan Kakap/Patin Panggang (150g) + Kentang Rebus (100g) + Tumis Buncis & Asparagus kukus.',
          estCalories: 380,
          macros: { protein: 35, carbs: 32, fat: 7 }
        }
      ]
    },
    MAINTAIN: {
      goalDescription: 'Fokus pada menjaga berat badan stabil dengan komposisi tubuh seimbang dan tingkat energi optimal untuk aktivitas sehari-hari.',
      meals: [
        {
          time: 'Sarapan (07:00 - 08:30)',
          menu: 'Oatmeal (70g) dengan Pisang setengah + 1 sdm Madu + 2 Telur Rebus Utuh + Teh Hijau.',
          estCalories: 480,
          macros: { protein: 24, carbs: 60, fat: 14 }
        },
        {
          time: 'Makan Siang (12:00 - 13:30)',
          menu: 'Nasi Merah (150g) + Semur Daging Sapi tanpa lemak (120g) + Tempe Panggang + Tumis Sayur Pakcoy.',
          estCalories: 620,
          macros: { protein: 38, carbs: 75, fat: 16 }
        },
        {
          time: 'Camilan Sore (16:00 - 17:00)',
          menu: 'Apel 1 buah + Jus Whey Protein (1 scoop) atau Jus Alpukat Rendah Gula.',
          estCalories: 280,
          macros: { protein: 26, carbs: 25, fat: 8 }
        },
        {
          time: 'Makan Malam (19:00 - 20:30)',
          menu: 'Nasi Merah (100g) + Pepes Ikan Tuna (150g) + Tahu Goreng Udara + Sup Jamur Kuping.',
          estCalories: 520,
          macros: { protein: 38, carbs: 55, fat: 12 }
        }
      ]
    }
  };

  return recommendations[targetFitness] || recommendations.MAINTAIN;
};

module.exports = {
  calculateDailyNutritionPlan,
  getNutritionPlan,
  getMealRecommendations,
};
