
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding quizzes (Indonesian)...');

    // Clear existing quizzes to avoid duplicates/mixed languages
    await prisma.quiz.deleteMany({});

    const quizzes = [
        {
            question: "Perintah apa yang digunakan untuk melihat daftar file dalam direktori?",
            options: ["ls", "cd", "mkdir", "rm"],
            correctAnswer: 0,
            points: 2
        },
        {
            question: "Kode permission manakah yang melambangkan akses 'baca' dan 'tulis' saja?",
            options: ["777", "600", "644", "755"],
            correctAnswer: 1, // 6 = 4(r) + 2(w)
            points: 2
        },
        {
            question: "Berapakah port default untuk layanan SSH?",
            options: ["80", "443", "22", "21"],
            correctAnswer: 2,
            points: 2
        },
        {
            question: "Perintah manakah yang digunakan untuk mengecek penggunaan disk (disk usage)?",
            options: ["df", "du", "top", "free"],
            correctAnswer: 1,
            points: 2
        },
        {
            question: "Apa fungsi dari perintah 'sudo'?",
            options: ["Super User Do (Menjalankan perintah sebagai root)", "System Update Do", "Server User Do", "Safe User Do"],
            correctAnswer: 0,
            points: 2
        }
    ];

    for (const q of quizzes) {
        await prisma.quiz.create({
            data: q
        });
    }

    console.log(`Seeded ${quizzes.length} quizzes.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
