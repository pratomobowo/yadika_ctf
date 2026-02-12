
"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Save, X, ArrowLeft, Brain } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Quiz {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    points: number;
    _count?: {
        attempts: number;
    };
}

export default function AdminQuizPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState(0);
    const [points, setPoints] = useState(2);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const res = await fetch('/api/admin/quiz');
            const data = await res.json();
            setQuizzes(data.quizzes || []);
        } catch (error) {
            console.error('Failed to fetch quizzes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/admin/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question,
                    options: options.filter(o => o.trim() !== ''),
                    correctAnswer,
                    points
                })
            });

            if (res.ok) {
                setIsCreating(false);
                setQuestion('');
                setOptions(['', '', '', '']);
                setCorrectAnswer(0);
                fetchQuizzes();
            } else {
                alert('Failed to create quiz');
            }
        } catch (error) {
            console.error('Create error', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this question?')) return;

        try {
            // Logic for delete endpoint (needs to be implemented in API if not already)
            // For now, let's assume we add DELETE method to /api/admin/quiz/route.ts or /[id]
            // Since I only created GET/POST in list route, I might need to add DELETE logic there or separate route.
            // I'll add a simple DELETE to the main route with body id for simplicity or query param.
            const res = await fetch(`/api/admin/quiz?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchQuizzes();
            }
        } catch (error) {
            console.error('Delete error', error);
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-foreground font-mono p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter">Manajer Kuis</h1>
                            <p className="text-xs text-foreground/40">Kelola bank soal kuis harian</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-bold text-xs uppercase hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={16} />
                        Tambah Soal
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-12 opacity-50">Loading questions...</div>
                ) : (
                    <div className="grid gap-4">
                        {quizzes.map(quiz => (
                            <div key={quiz.id} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-[10px] font-bold shrink-0">
                                            {quiz.points} PTS
                                        </div>
                                        <h3 className="font-bold text-sm">{quiz.question}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {quiz.options.map((opt, i) => (
                                            <div key={i} className={`text-xs px-3 py-2 rounded border ${i === quiz.correctAnswer
                                                ? 'bg-green-500/10 border-green-500/30 text-green-500'
                                                : 'bg-black/20 border-white/5 text-foreground/60'
                                                }`}>
                                                {String.fromCharCode(65 + i)}. {opt}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <div className="text-[10px] text-foreground/40">
                                        Attempts: <span className="text-white">{quiz._count?.attempts || 0}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(quiz.id)}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Hapus Soal"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {quizzes.length === 0 && (
                            <div className="text-center py-12 text-foreground/40 box-dashed border-2 border-dashed border-white/10 rounded-xl">
                                <Brain size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Belum ada soal kuis.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0d0d0f] border border-white/10 w-full max-w-lg rounded-xl p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-bold font-mono text-lg">Tambah Soal Baru</h2>
                                <button onClick={() => setIsCreating(false)} className="text-foreground/40 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] uppercase text-foreground/40 font-bold mb-1">Pertanyaan</label>
                                    <textarea
                                        value={question}
                                        onChange={e => setQuestion(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50"
                                        rows={3}
                                        required
                                        placeholder="Tulis pertanyaan di sini..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase text-foreground/40 font-bold">Pilihan Jawaban (Pilih yang benar)</label>
                                    {options.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="correctAnswer"
                                                checked={correctAnswer === i}
                                                onChange={() => setCorrectAnswer(i)}
                                                className="accent-primary"
                                            />
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={e => updateOption(i, e.target.value)}
                                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/50"
                                                placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase text-foreground/40 font-bold mb-1">Poin</label>
                                    <input
                                        type="number"
                                        value={points}
                                        onChange={e => setPoints(parseInt(e.target.value))}
                                        className="w-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/50"
                                        min={1}
                                        required
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="flex-1 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-bold uppercase"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-2.5 rounded-lg bg-primary text-black text-xs font-bold uppercase hover:bg-primary/90 flex items-center justify-center gap-2"
                                    >
                                        <Save size={16} />
                                        {submitting ? 'Menyimpan...' : 'Simpan Soal'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
