"use client";

import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer
} from 'recharts';

interface SkillStat {
    subject: string;
    A: number;
    fullMark: number;
}

interface SkillRadarProps {
    data: SkillStat[];
}

export default function SkillRadar({ data }: SkillRadarProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="w-full h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    />
                    <Radar
                        name="Skills"
                        dataKey="A"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.4}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
