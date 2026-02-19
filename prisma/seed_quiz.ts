
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding quizzes (Indonesian)...');

    // Clear existing quizzes to avoid duplicates/mixed languages
    await prisma.quiz.deleteMany({});

    const quizzes = [
        // --- LINUX CLI (15) ---
        { question: "Perintah apa yang digunakan untuk melihat daftar file dalam direktori secara detail?", options: ["ls -l", "ls -a", "ls -f", "ls -x"], correctAnswer: 0, points: 2 },
        { question: "Bagaimana cara membuat direktori baru di Linux?", options: ["mkdir", "touch", "rmdir", "mv"], correctAnswer: 0, points: 2 },
        { question: "Perintah apa yang digunakan untuk berpindah direktori?", options: ["cd", "cp", "mv", "rm"], correctAnswer: 0, points: 2 },
        { question: "Manakah perintah untuk menghapus file secara permanen?", options: ["del", "rm", "erase", "scrub"], correctAnswer: 1, points: 2 },
        { question: "Perintah apa yang digunakan untuk menyalin file atau direktori?", options: ["mv", "cp", "ln", "sc"], correctAnswer: 1, points: 2 },
        { question: "Bagaimana cara membaca isi file teks di terminal?", options: ["grep", "cat", "tail", "echo"], correctAnswer: 1, points: 2 },
        { question: "Perintah untuk memindahkan atau mengubah nama file adalah?", options: ["mv", "rn", "cp", "ls"], correctAnswer: 0, points: 2 },
        { question: "Manakah perintah untuk mencari teks tertentu di dalam file?", options: ["find", "grep", "search", "locate"], correctAnswer: 1, points: 2 },
        { question: "Bagaimana cara melihat sisa ruang penyimpanan di Linux?", options: ["du", "df", "top", "free"], correctAnswer: 1, points: 2 },
        { question: "Perintah untuk melihat penggunaan RAM adalah?", options: ["mem", "ram", "free", "df"], correctAnswer: 2, points: 2 },
        { question: "Bagaimana cara melihat proses yang sedang berjalan secara real-time?", options: ["ps", "top", "list", "jobs"], correctAnswer: 1, points: 2 },
        { question: "Manakah perintah untuk menghentikan proses menggunakan PID?", options: ["stop", "kill", "halt", "end"], correctAnswer: 1, points: 2 },
        { question: "Bagaimana cara menampilkan 10 baris terakhir dari sebuah file?", options: ["head", "tail", "last", "end"], correctAnswer: 1, points: 2 },
        { question: "Perintah 'pwd' singkatan dari?", options: ["Print Working Directory", "Path Working Directory", "Private Working Directory", "Process Working Directory"], correctAnswer: 0, points: 2 },
        { question: "Bagaimana cara memberikan izin eksekusi pada file 'script.sh'?", options: ["chmod +x script.sh", "chmod 644 script.sh", "chmod -x script.sh", "chmod +r script.sh"], correctAnswer: 0, points: 2 },

        // --- SYSADMIN (15) ---
        { question: "File manakah yang berisi informasi akun pengguna di Linux?", options: ["/etc/groups", "/etc/passwd", "/etc/shadow", "/etc/users"], correctAnswer: 1, points: 2 },
        { question: "Perintah untuk membuat user baru di sistem adalah?", options: ["newuser", "adduser", "mkuser", "usercreate"], correctAnswer: 1, points: 2 },
        { question: "Bagaimana cara mengubah password user di Linux?", options: ["pass", "passwd", "chpass", "setpass"], correctAnswer: 1, points: 2 },
        { question: "Perintah 'chown' digunakan untuk?", options: ["Mengubah group file", "Mengubah pemilik file", "Mengubah izin file", "Menghapus file"], correctAnswer: 1, points: 2 },
        { question: "Apa arti dari permission '755' pada sebuah folder?", options: ["Owner rwx, Group rx, Public rx", "Owner rw, Group r, Public r", "Owner rwx, Group r, Public r", "Semua rwx"], correctAnswer: 0, points: 2 },
        { question: "Manakah perintah untuk mengelola layanan di distro berbasis systemd?", options: ["service", "systemctl", "init.d", "chkconfig"], correctAnswer: 1, points: 2 },
        { question: "Bagaimana cara merestart layanan SSH?", options: ["systemctl restart ssh", "service restart sshd", "systemctl stop ssh", "ssh restart"], correctAnswer: 0, points: 2 },
        { question: "Dimana lokasi default log sistem (log files) di Linux?", options: ["/var/log", "/etc/log", "/usr/log", "/home/log"], correctAnswer: 0, points: 2 },
        { question: "Perintah untuk melihat waktu aktif sistem (uptime) adalah?", options: ["time", "uptime", "date", "status"], correctAnswer: 1, points: 2 },
        { question: "Konfigurasi network interface biasanya disimpan di dalam?", options: ["/etc/network", "/etc/hosts", "/etc/fstab", "/etc/resolv.conf"], correctAnswer: 0, points: 2 },
        { question: "File manakah yang menyimpan daftar DNS resolver?", options: ["/etc/hosts", "/etc/resolv.conf", "/etc/networks", "/etc/hostname"], correctAnswer: 1, points: 2 },
        { question: "Perintah 'iptables' digunakan untuk mengelola?", options: ["User", "File", "Firewall", "Storage"], correctAnswer: 2, points: 2 },
        { question: "Apa fungsi dari file '/etc/fstab'?", options: ["Konfigurasi Firewall", "Daftar User", "Mounting Filesystem secara otomatis", "Daftar DNS"], correctAnswer: 2, points: 2 },
        { question: "Bagaimana cara menambahkan user ke group 'sudo'?", options: ["usermod -aG sudo namauser", "useradd sudo namauser", "groupadd sudo namauser", "chmod +G sudo namauser"], correctAnswer: 0, points: 2 },
        { question: "Aplikasi manakah yang digunakan untuk kompresi file .tar.gz?", options: ["zip", "tar", "gzip", "compress"], correctAnswer: 1, points: 2 },

        // --- DOCKER (10) ---
        { question: "Perintah untuk melihat daftar container yang sedang berjalan adalah?", options: ["docker list", "docker ps", "docker images", "docker run"], correctAnswer: 1, points: 2 },
        { question: "Bagaimana cara mendownload image dari Docker Hub?", options: ["docker build", "docker get", "docker pull", "docker push"], correctAnswer: 2, points: 2 },
        { question: "Perintah untuk menjalankan container baru dari sebuah image adalah?", options: ["docker start", "docker run", "docker execute", "docker up"], correctAnswer: 1, points: 2 },
        { question: "Apa fungsi dari instruksi 'FROM' di dalam Dockerfile?", options: ["Menentukan penulis", "Menentukan base image", "Menentukan port", "Menentukan perintah run"], correctAnswer: 1, points: 2 },
        { question: "Perintah untuk menghapus container yang sudah mati adalah?", options: ["docker rm", "docker rmi", "docker stop", "docker prune"], correctAnswer: 0, points: 2 },
        { question: "Bagaimana cara melihat log dari sebuah container?", options: ["docker logs", "docker cat", "docker info", "docker events"], correctAnswer: 0, points: 2 },
        { question: "Perintah untuk membangun image sendiri menggunakan Dockerfile adalah?", options: ["docker create", "docker build", "docker make", "docker compile"], correctAnswer: 1, points: 2 },
        { question: "Apa guna dari perintah 'docker-compose up'?", options: ["Menjalankan satu container", "Menjalankan multi-container sesuai YAML", "Hanya mendownload image", "Menghapus semua container"], correctAnswer: 1, points: 2 },
        { question: "Bagaimana cara masuk ke dalam shell container yang sedang berjalan?", options: ["docker bash", "docker ssh", "docker exec -it", "docker attach"], correctAnswer: 2, points: 2 },
        { question: "Instruksi Dockerfile apa yang digunakan untuk mengekspor port?", options: ["PORT", "EXPOSE", "LISTEN", "NETWORK"], correctAnswer: 1, points: 2 },

        // --- CYBERSECURITY BASICS (10) ---
        { question: "Apa itu serangan 'Brute Force'?", options: ["Mencoba semua kombinasi password", "Mengirim ribuan paket ping", "Menipu user dengan link palsu", "Mencuri database lewat SQL"], correctAnswer: 0, points: 2 },
        { question: "Istilah 'Salt' dalam pengamanan password digunakan untuk?", options: ["Mempercepat login", "Menambah teks acak sebelum hash", "Menghapus password lama", "Mengompresi password"], correctAnswer: 1, points: 2 },
        { question: "Protokol keamanan mana yang digunakan untuk akses remote terenkripsi?", options: ["Telnet", "SSH", "FTP", "HTTP"], correctAnswer: 1, points: 2 },
        { question: "Apa yang dimaksud dengan SQL Injection?", options: ["Menyuntikkan virus ke file SQL", "Memasukkan kode SQL berbahaya ke input form", "Menghapus database server", "Mengubah password root SQL"], correctAnswer: 1, points: 2 },
        { question: "Fungsi hashing bersifat 'satu arah', artinya?", options: ["Mudah didekripsi", "Data tidak bisa dikembalikan ke aslinya", "Sangat lambat", "Hanya bisa jalan di satu OS"], correctAnswer: 1, points: 2 },
        { question: "Apa itu serangan 'Phishing'?", options: ["Serangan ke server database", "Menipu korban agar memberikan data pribadi lewat email/web palsu", "Mematikan server dengan traffic tinggi", "Mencuri data wifi"], correctAnswer: 1, points: 2 },
        { question: "Manakah port standar untuk protokol HTTPS?", options: ["80", "8080", "443", "8443"], correctAnswer: 2, points: 2 },
        { question: "Serangan yang bertujuan melumpuhkan server dengan membanjiri traffic disebut?", options: ["DDoS", "MITM", "Sniffing", "Spoofing"], correctAnswer: 0, points: 2 },
        { question: "Istilah 'Least Privilege' dalam keamanan berarti?", options: ["Memberikan akses penuh ke semua staf", "Hanya memberikan akses secukupnya yang dibutuhkan", "Menghapus akses user root", "Mengizinkan login tanpa password"], correctAnswer: 1, points: 2 },
        { question: "Apa fungsi utama dari Firewall?", options: ["Mempercepat internet", "Memonitor dan memfilter trafik masuk/keluar", "Menghapus file virus", "Membuat backup otomatis"], correctAnswer: 1, points: 2 }
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
