
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Timer, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface QuizData {
    id: string;
    question: string;
    options: string[];
    points: number;
}

export default function DailyQuizCard() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [available, setAvailable] = useState(false);
    const [message, setMessage] = useState('');
    const [nextAvailable, setNextAvailable] = useState<string | null>(null);

    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ correct: boolean; points: number; correctAnswer?: number } | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (!nextAvailable) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(nextAvailable).getTime();
            const difference = target - now;

            if (difference <= 0) {
                clearInterval(interval);
                setTimeLeft('Sekarang');
            } else {
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}j ${minutes}m ${seconds}d`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [nextAvailable]);

    useEffect(() => {
        fetchQuiz();
    }, []);

    const fetchQuiz = async () => {
        try {
            const res = await fetch('/api/quiz/daily');
            const data = await res.json();

            if (data.available) {
                setAvailable(true);
                setQuiz(data.quiz);
            } else {
                setAvailable(false);
                setMessage(data.message);
                setNextAvailable(data.nextAvailable);
            }
        } catch (error) {
            console.error('Failed to fetch quiz', error);
            setMessage('Gagal memuat kuis. Silakan coba lagi nanti.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (selectedOption === null || !quiz) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quizId: quiz.id,
                    answerIndex: selectedOption
                })
            });

            const data = await res.json();

            if (res.ok) {
                setResult({
                    correct: data.isCorrect,
                    points: data.pointsAwarded,
                    correctAnswer: data.correctAnswer // Only present if wrong, depending on API
                });
                if (data.isCorrect) {
                    refreshUser(); // Update points in context
                }
            } else {
                alert(data.error || 'Gagal mengirim jawaban');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Gagal mengirim jawaban.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={24} />
            </div>
        );
    }

    if (!available) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-full relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">


                <div className="flex items-center gap-4">
                    <div className="bg-green-500/10 p-3 rounded-full shrink-0">
                        <CheckCircle2 size={24} className="text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold font-mono uppercase">Kuis Harian Selesai</h3>
                        <p className="text-[10px] text-foreground/60 font-mono leading-relaxed max-w-[200px]">{message}</p>
                    </div>
                </div>

                {nextAvailable && (
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-2 text-[10px] text-foreground/40 font-mono bg-black/20 px-4 py-2 rounded-lg border border-white/5">
                            <Timer size={12} />
                            <span>Kuis berikutnya dalam:</span>
                        </div>
                        <div className="text-2xl font-black font-mono text-primary tracking-tighter">
                            {timeLeft}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (result) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-full flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-4 rounded-full ${result.correct ? 'bg-green-500/20' : 'bg-red-500/20'}`}
                >
                    {result.correct ? (
                        <CheckCircle2 size={32} className="text-green-500" />
                    ) : (
                        <XCircle size={32} className="text-red-500" />
                    )}
                </motion.div>

                <div>
                    <h3 className={`text-lg font-black font-mono uppercase ${result.correct ? 'text-green-500' : 'text-red-500'}`}>
                        {result.correct ? 'Benar!' : 'Jawaban Salah'}
                    </h3>
                    <p className="text-xs text-foreground/60 font-mono mt-1">
                        {result.correct
                            ? `Kamu mendapatkan +${result.points} poin!`
                            : (
                                <span>
                                    Jawaban yang benar adalah: <br />
                                    <span className="font-bold text-white mt-1 block">
                                        {quiz?.options[result.correctAnswer!] || ''}
                                    </span>
                                </span>
                            )}
                    </p>
                </div>

                <button
                    onClick={() => setAvailable(false)} // Hides the quiz content
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono transition-colors"
                >
                    Tutup
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-full relative overflow-hidden flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 text-primary">
                    <h3 className="font-bold font-mono text-sm uppercase">Kuis Harian</h3>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded text-[10px] font-mono text-amber-500 font-bold">
                    +{quiz?.points} PTS
                </div>
            </div>

            <p className="text-sm font-mono text-foreground/90 mb-6 flex-1">
                {quiz?.question}
            </p>

            <div className="space-y-2 mb-6">
                {quiz?.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full text-left px-4 py-3 rounded-lg border text-xs font-mono transition-all ${selectedOption === idx
                            ? 'bg-primary/20 border-primary text-white'
                            : 'bg-black/20 border-white/5 text-foreground/60 hover:bg-white/5 hover:border-white/10'
                            }`}
                    >
                        <span className="opacity-50 mr-3">{String.fromCharCode(65 + idx)}.</span>
                        {option}
                    </button>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                disabled={selectedOption === null || submitting}
                className="w-full py-2.5 bg-primary text-black font-bold font-mono text-xs uppercase rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
            </button>
        </div>
    );
}
