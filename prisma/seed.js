require('dotenv').config();
const prisma = require('../src/config/prisma');

const exercises = [
  // Dada (Chest)
  {
    name: 'Bench Press',
    description: 'Berbaring di bangku dan dorong barbell ke atas dari dada untuk melatih otot dada bagian tengah, bahu depan, dan triceps.',
    category: 'Kekuatan',
    muscleGroup: 'Dada'
  },
  {
    name: 'Push Up',
    description: 'Latihan beban tubuh yang berfokus pada dada, bahu, dan triceps dengan cara menurunkan dan menaikkan tubuh dari lantai.',
    category: 'Kekuatan',
    muscleGroup: 'Dada'
  },
  {
    name: 'Dumbbell Fly',
    description: 'Berbaring di atas bangku datar dan rentangkan tangan dengan dumbbell ke samping lalu satukan di atas dada.',
    category: 'Kekuatan',
    muscleGroup: 'Dada'
  },
  // Punggung (Back)
  {
    name: 'Pull Up',
    description: 'Mengangkat beban tubuh dengan berpegangan pada tiang horizontal untuk membangun otot punggung atas (Lats) dan biceps.',
    category: 'Kekuatan',
    muscleGroup: 'Punggung'
  },
  {
    name: 'Barbell Row',
    description: 'Membungkuk dengan posisi punggung lurus dan menarik barbell ke arah perut untuk melatih ketebalan otot punggung.',
    category: 'Kekuatan',
    muscleGroup: 'Punggung'
  },
  {
    name: 'Lat Pulldown',
    description: 'Menarik tuas kabel ke bawah menuju dada atas untuk melatih otot punggung agar terlihat lebih lebar (wings).',
    category: 'Kekuatan',
    muscleGroup: 'Punggung'
  },
  // Kaki (Legs)
  {
    name: 'Squat',
    description: 'Gerakan jongkok-berdiri dengan memikul barbell untuk melatih quadriceps, hamstrings, dan glutes.',
    category: 'Kekuatan',
    muscleGroup: 'Kaki'
  },
  {
    name: 'Deadlift',
    description: 'Mengangkat beban barbell dari lantai sampai berdiri tegak. Bagus untuk melatih seluruh tubuh posterior chain (punggung bawah, glutes, hamstrings).',
    category: 'Kekuatan',
    muscleGroup: 'Kaki'
  },
  {
    name: 'Leg Press',
    description: 'Mendorong platform beban menggunakan kaki dalam sudut kemiringan tertentu untuk melatih paha depan.',
    category: 'Kekuatan',
    muscleGroup: 'Kaki'
  },
  {
    name: 'Lunges',
    description: 'Melangkah ke depan dan menurunkan pinggul sampai kedua lutut menekuk 90 derajat untuk keseimbangan dan kekuatan kaki.',
    category: 'Kekuatan',
    muscleGroup: 'Kaki'
  },
  // Bahu (Shoulders)
  {
    name: 'Overhead Press',
    description: 'Mendorong barbell atau dumbbell ke atas kepala dari posisi berdiri atau duduk untuk melatih otot bahu (deltoids).',
    category: 'Kekuatan',
    muscleGroup: 'Bahu'
  },
  {
    name: 'Lateral Raise',
    description: 'Mengangkat dumbbell ke samping tubuh hingga setinggi bahu untuk melatih otot bahu bagian samping agar lebar.',
    category: 'Kekuatan',
    muscleGroup: 'Bahu'
  },
  // Lengan (Arms)
  {
    name: 'Bicep Curl',
    description: 'Menekuk siku dengan beban dumbbell/barbell ke arah bahu untuk melatih otot biceps depan.',
    category: 'Kekuatan',
    muscleGroup: 'Lengan'
  },
  {
    name: 'Tricep Pushdown',
    description: 'Mendorong tuas kabel ke bawah meluruskan siku untuk mengisolasi dan melatih otot triceps belakang.',
    category: 'Kekuatan',
    muscleGroup: 'Lengan'
  },
  // Core / Perut
  {
    name: 'Plank',
    description: 'Menahan posisi tubuh seperti push-up dengan tumpuan siku untuk melatih kekuatan core (perut dan punggung bawah).',
    category: 'Kekuatan',
    muscleGroup: 'Core'
  },
  {
    name: 'Crunch',
    description: 'Mengangkat bahu dari lantai secara terkontrol untuk mengisolasi otot perut bagian atas.',
    category: 'Kekuatan',
    muscleGroup: 'Core'
  },
  {
    name: 'Hanging Leg Raise',
    description: 'Bergelantungan pada bar lalu mengangkat kaki lurus atau menekuk lutut ke arah dada untuk perut bagian bawah.',
    category: 'Kekuatan',
    muscleGroup: 'Core'
  },
  // Kardio (Cardio)
  {
    name: 'Running',
    description: 'Lari dengan kecepatan sedang hingga tinggi untuk meningkatkan kapasitas kardiovaskular dan membakar kalori.',
    category: 'Kardio',
    muscleGroup: 'Seluruh Tubuh'
  },
  {
    name: 'Cycling',
    description: 'Bersepeda statis atau bersepeda jalan raya untuk melatih daya tahan kardio dan kekuatan otot paha.',
    category: 'Kardio',
    muscleGroup: 'Kaki'
  },
  {
    name: 'Jumping Jack',
    description: 'Melompat sambil merentangkan tangan dan kaki untuk meningkatkan detak jantung dengan cepat.',
    category: 'Kardio',
    muscleGroup: 'Seluruh Tubuh'
  }
];async function main() {
  console.log('Memulai seeding data latihan...');
  
  // Bersihkan data latihan lama
  await prisma.workoutExercise.deleteMany();
  await prisma.exercise.deleteMany();
  
  for (const item of exercises) {
    await prisma.exercise.create({
      data: item
    });
  }
  
  console.log('Seeding selesai! Berhasil menambahkan ' + exercises.length + ' latihan.');

  console.log('Memulai seeding admin...');
  const adminEmail = 'admin@gym.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('adminpassword', 10);
    await prisma.user.create({
      data: {
        name: 'Admin GymAI',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('Admin seeded! Email: admin@gym.com, Password: adminpassword');
  } else {
    console.log('Admin sudah terdaftar.');
  }
}
main()
  .catch((e) => {
    console.error('Gagal melakukan seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
