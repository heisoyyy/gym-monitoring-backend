const { OpenAI } = require('openai');
const chatRepository = require('../repositories/chatRepository');
const bodyService = require('./bodyService');
const nutritionService = require('./nutritionService');

// Inisialisasi OpenAI secara opsional
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// SIMULATOR AI LOKAL (FALLBACK MODE)
const getLocalAIResponse = async (userId, userMessage) => {
  const profileDetails = await bodyService.getUserProfileDetails(userId);
  const msg = userMessage.toLowerCase();
  
  // Jika profil belum diisi
  if (!profileDetails) {
    return "Halo! Saya adalah AI Fitness Assistant Anda. Sebelum kita mulai membuat rencana program latihan dan nutrisi yang tepat, mohon lengkapi data fisik Anda (Tinggi badan, Berat badan, Umur, dan Target Fitness) terlebih dahulu di menu **Analisis Tubuh** ya!";
  }

  const { name } = profileDetails.profile.user || { name: 'Fighter' };
  const { height, weight, targetFitness, bmi, tdee, bmr } = profileDetails.profile;
  const status = profileDetails.status;
  const ideal = profileDetails.idealWeight;
  const nutrition = await nutritionService.getNutritionPlan(userId);

  // 1. Deteksi Kata Kunci Makan / Nutrisi / Kalori
  if (msg.includes('makan') || msg.includes('diet') || msg.includes('nutrisi') || msg.includes('kalori') || msg.includes('resep') || msg.includes('protein')) {
    const mealRecs = nutritionService.getMealRecommendations(targetFitness);
    let response = `Halo **${name}**, berdasarkan target fitness Anda yaitu **${targetFitness}**, berikut adalah analisis kebutuhan nutrisi harian Anda:\n\n`;
    response += `- **Kebutuhan Kalori**: ${nutrition ? nutrition.dailyCalories : Math.round(tdee)} kcal per hari.\n`;
    response += `- **Target Makro**: Protein ${nutrition ? nutrition.protein : '?'}g, Karbohidrat ${nutrition ? nutrition.carbs : '?'}g, Lemak ${nutrition ? nutrition.fat : '?'}g.\n\n`;
    response += `**Rekomendasi Menu Sehat Anda**:\n`;
    
    mealRecs.meals.forEach(m => {
      response += `\n* **${m.time}**\n  Menu: ${m.menu}\n  Est. Kalori: ${m.estCalories} kcal (P: ${m.macros.protein}g, K: ${m.macros.carbs}g, L: ${m.macros.fat}g)\n`;
    });
    
    response += `\n*Tips Nutrisi*: Pastikan Anda minum air putih minimal 2-3 liter per hari dan batasi konsumsi gula berlebih agar target ${targetFitness.toLowerCase()} Anda tercapai lebih cepat!`;
    return response;
  }

  // 2. Deteksi Kata Kunci Latihan / Olahraga / Workout / Gerakan / Program
  if (msg.includes('latih') || msg.includes('olahraga') || msg.includes('workout') || msg.includes('gerakan') || msg.includes('program') || msg.includes('jadwal')) {
    let response = `Hai **${name}**, untuk mendukung program **${targetFitness}** Anda, saya menyarankan rencana latihan berikut:\n\n`;
    
    if (targetFitness === 'BULKING') {
      response += `**Rekomendasi Program (Hipertrofi/Massa Otot)**:\n`;
      response += `- Lakukan latihan kekuatan (Weight Training) 4-5 kali seminggu.\n`;
      response += `- Fokus pada gerakan komposit (Compound Movements) seperti **Squat, Bench Press, Deadlift, dan Pull Up**.\n`;
      response += `- Atur repetisi di kisaran **8-12 reps** per set dengan beban yang menantang (60-80% dari kekuatan maksimal Anda).\n`;
      response += `- Istirahat 90-120 detik antar set.\n`;
      response += `- Batasi latihan kardio berat (cukup 1-2 kali seminggu, 15-20 menit) agar kalori tidak terlalu banyak terbuang.`;
    } else if (targetFitness === 'CUTTING') {
      response += `**Rekomendasi Program (Bakar Lemak & Defisit Kalori)**:\n`;
      response += `- Tetap lakukan latihan kekuatan 3-4 kali seminggu untuk mempertahankan massa otot.\n`;
      response += `- Kombinasikan dengan latihan kardio seperti **Running (Lari) atau Cycling (Bersepeda)** setelah latihan beban (20-30 menit) atau di hari terpisah.\n`;
      response += `- Gunakan repetisi kisaran **12-15 reps** per set dengan beban moderat.\n`;
      response += `- Jaga denyut jantung Anda di zona pembakaran lemak (Fat Burn Zone) sekitar 60-70% dari detak jantung maksimal.`;
    } else {
      response += `**Rekomendasi Program (Maintain / Kebugaran Umum)**:\n`;
      response += `- Kombinasikan latihan kekuatan (3 kali seminggu) dan kardio moderat (2 kali seminggu).\n`;
      response += `- Gunakan variasi gerakan seperti **Push Up, Lat Pulldown, Lunges, dan Plank** untuk melatih seluruh kelompok otot (Full Body).\n`;
      response += `- Lakukan aktivitas aktif harian (seperti berjalan kaki minimal 7.000-10.000 langkah sehari).`;
    }

    response += `\n\nAnda dapat menyusun jadwal latihan harian ini di menu **Workout Planner** pada aplikasi ini!`;
    return response;
  }

  // 3. Deteksi Kata Kunci BMI / Tubuh / Status / Berat Badan / Ideal
  if (msg.includes('bmi') || msg.includes('tubuh') || msg.includes('berat') || msg.includes('status') || msg.includes('ideal') || msg.includes('tinggi')) {
    let response = `Berikut adalah ringkasan analisis kondisi tubuh Anda saat ini, **${name}**:\n\n`;
    response += `- **Tinggi Badan**: ${height} cm\n`;
    response += `- **Berat Badan**: ${weight} kg\n`;
    response += `- **Skor BMI**: ${bmi} (**Status: ${status}**)\n`;
    response += `- **Berat Badan Ideal**: kisaran **${ideal.min} kg - ${ideal.max} kg** (Rekomendasi titik ideal: ${ideal.ideal} kg)\n`;
    response += `- **BMR (Basal Metabolic Rate)**: ${bmr} kcal (Kalori yang dibakar tubuh saat istirahat total)\n`;
    response += `- **TDEE (Total Daily Energy Expenditure)**: ${tdee} kcal (Kebutuhan kalori harian berdasarkan tingkat aktivitas)\n\n`;

    if (status === 'UNDERWEIGHT') {
      response += `⚠️ Status Anda **Kurang Berat Badan (Underweight)**. Sangat disarankan untuk meningkatkan asupan kalori (fokus makanan padat nutrisi) dan latihan beban secara teratur.`;
    } else if (status === 'NORMAL') {
      response += `✅ Status Anda **Normal (Ideal)**. Pertahankan pola makan sehat seimbang dan olahraga teratur agar kondisi fisik prima tetap terjaga.`;
    } else if (status === 'OVERWEIGHT') {
      response += `⚠️ Status Anda **Kelebihan Berat Badan (Overweight)**. Disarankan memulai defisit kalori ringan (kurangi porsi karbohidrat sederhana/gorengan) dan tingkatkan aktivitas kardio Anda.`;
    } else {
      response += `🚨 Status Anda **Obesitas (Obese)**. Prioritaskan kesehatan dengan defisit kalori konsisten, kurangi makanan olahan tinggi lemak/gula, serta lakukan latihan kardio low-impact (seperti jalan cepat atau sepeda statis) guna melindungi persendian kaki Anda.`;
    }

    return response;
  }

  // 4. Deteksi Sapaan / Greeting
  if (msg.includes('halo') || msg.includes('hai') || msg.includes('hello') || msg.includes('pagi') || msg.includes('siang') || msg.includes('malam') || msg.includes('sore')) {
    return `Halo **${name}**! 👋 Saya adalah AI Fitness Assistant Anda.\n\nSaya siap membantu Anda mencapai target tubuh impian Anda. Anda bisa menanyakan hal-hal seperti:\n1. *"Bagaimana menu makanan diet untuk program saya?"*\n2. *"Rekomendasi latihan olahraga yang cocok?"*\n3. *"Tolong analisis BMI dan berat badan ideal saya"*`;
  }

  // 5. Default Response
  return `Saya mengerti pertanyaan Anda, **${name}**. Sebagai asisten fitness Anda, saya ingin mengingatkan bahwa saat ini Anda berada di program **${targetFitness}** dengan berat badan **${weight} kg** (BMI: ${bmi}, Status: ${status}).\n\nUntuk hasil terbaik, silakan tanyakan secara spesifik tentang **"makanan diet"**, **"gerakan latihan kekuatan/kardio"**, atau **"analisis berat badan ideal"**. Apa yang ingin Anda diskusikan lebih lanjut hari ini?`;
};

// KIRIM PESAN KE AI CHATBOT
const sendMessageToAI = async (userId, userMessage) => {
  // 1. Simpan pesan user ke database
  await chatRepository.saveChatMessage(userId, 'USER', userMessage);

  let aiResponseText = '';

  if (openai) {
    try {
      // Dapatkan data profil pengguna untuk konteks prompt engineering
      const profileDetails = await bodyService.getUserProfileDetails(userId);
      let systemPrompt = "Anda adalah AI Fitness Assistant profesional bernama 'GymAI' yang ramah dan berdedikasi tinggi. Anda membantu menjawab pertanyaan seputar olahraga, gym, nutrisi, kesehatan, dan program latihan. Jawablah selalu dalam Bahasa Indonesia dengan bahasa yang memotivasi dan informatif.\n\n";

      if (profileDetails) {
        const { height, weight, targetFitness, bmi, tdee } = profileDetails.profile;
        const status = profileDetails.status;
        systemPrompt += `Konteks Pengguna Aktif:\n- Nama: ${profileDetails.profile.user?.name || 'User'}\n- Tinggi: ${height} cm\n- Berat: ${weight} kg\n- BMI: ${bmi} (Kategori: ${status})\n- TDEE (Kebutuhan Kalori Harian): ${tdee} kcal\n- Target Fitness Utama: ${targetFitness}\n\nBerikan jawaban yang disesuaikan secara personal dengan profil tubuh pengguna di atas jika mereka bertanya mengenai program diet, latihan, atau evaluasi tubuh.`;
      }

      // Ambil riwayat chat sebelumnya untuk ingatan AI (maksimal 10 chat terakhir)
      const rawHistory = await chatRepository.getChatHistoryByUserId(userId);
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...rawHistory.slice(-10).map(chat => ({
          role: chat.role === 'USER' ? 'user' : 'assistant',
          content: chat.content,
        })),
        { role: 'user', content: userMessage }
      ];

      // Panggil OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Menggunakan model gpt-4o-mini yang efisien dan cepat
        messages: formattedMessages,
        max_tokens: 800,
      });

      aiResponseText = completion.choices[0].message.content;
    } catch (error) {
      console.error('Error saat menghubungi OpenAI API, mengalihkan ke Simulator Lokal:', error.message);
      // Fallback ke simulator lokal jika API gagal (misal kuota habis)
      aiResponseText = await getLocalAIResponse(userId, userMessage);
    }
  } else {
    // Mode Fallback: OpenAI key tidak tersedia
    aiResponseText = await getLocalAIResponse(userId, userMessage);
  }

  // 2. Simpan respon AI ke database
  const savedResponse = await chatRepository.saveChatMessage(userId, 'ASSISTANT', aiResponseText);

  return savedResponse;
};

const getChatHistory = async (userId) => {
  return chatRepository.getChatHistoryByUserId(userId);
};

const clearChatHistory = async (userId) => {
  return chatRepository.clearChatHistoryByUserId(userId);
};

module.exports = {
  sendMessageToAI,
  getChatHistory,
  clearChatHistory,
};
