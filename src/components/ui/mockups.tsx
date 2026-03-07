"use client";

import { motion } from "framer-motion";
import { Activity, Play, Pause, SkipForward, Volume2, Maximize } from "lucide-react";

export function DashboardMockup() {
    return (
        <div className="w-full rounded-2xl bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 p-6 shadow-2xl relative">
            {/* Glossy reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.03] to-transparent opacity-80 pointer-events-none rounded-2xl" />

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <Activity className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium text-sm">Platform Analytics</h3>
                        <p className="text-white/40 text-xs">Real-time engagement</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                    <span className="text-emerald-400 text-xs font-medium">Live</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-white/40 text-xs mb-1">Active Learners</p>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-white tracking-tight">12,483</span>
                        <span className="text-emerald-400 text-[10px] bg-emerald-400/10 px-1.5 py-0.5 rounded flex items-center font-medium">+14%</span>
                    </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-white/40 text-xs mb-1">Course Completion</p>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-white tracking-tight">68.2%</span>
                        <span className="text-emerald-400 text-[10px] bg-emerald-400/10 px-1.5 py-0.5 rounded flex items-center font-medium">+2.4%</span>
                    </div>
                </div>
            </div>

            <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5 h-40 flex items-end justify-between gap-2 overflow-hidden relative">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

                {/* Fake chart bars */}
                {[45, 75, 50, 95, 70, 85, 110, 60, 85, 95].map((height, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 1.5, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                        className="w-full bg-gradient-to-t from-indigo-500/80 to-indigo-400 hover:to-rose-400 rounded-t-sm relative group cursor-pointer transition-colors"
                    >
                        <div className="absolute inset-x-0 top-0 h-1 bg-white/30 rounded-t-sm" />
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none z-10">
                            {height * 10} views
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Glowing orb behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/20 rounded-full blur-[50px] -z-10 pointer-events-none" />
        </div>
    );
}

export function CoursePlayerMockup() {
    return (
        <div className="w-full rounded-2xl bg-[#0B0F19]/90 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-indigo-500/5" />

            {/* Video Area */}
            <div className="relative aspect-video bg-black/60 group overflow-hidden">
                {/* Abstract animated background */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.2),transparent_60%)]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 20, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(225,29,72,0.2),transparent_50%)]"
                />

                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:bg-white/20 transition-colors"
                    >
                        <Play className="w-6 h-6 ml-1 drop-shadow-lg" />
                    </motion.div>
                </div>

                {/* Player Controls */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-full h-1 bg-white/20 rounded-full mb-3 overflow-hidden cursor-pointer relative">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '65%' }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="h-full bg-rose-500 relative"
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(244,63,94,1)] scale-0 group-hover:scale-100 transition-transform" />
                        </motion.div>
                    </div>
                    <div className="flex items-center justify-between text-white md:px-1">
                        <div className="flex items-center gap-4">
                            <Pause className="w-4 h-4 cursor-pointer hover:text-rose-400 transition-colors" />
                            <SkipForward className="w-4 h-4 cursor-pointer hover:text-rose-400 transition-colors" />
                            <div className="flex items-center gap-2 group/volume">
                                <Volume2 className="w-4 h-4 cursor-pointer hover:text-rose-400 transition-colors" />
                                <div className="w-0 overflow-hidden group-hover/volume:w-16 transition-all duration-300 h-1 bg-white/20 rounded-full hidden sm:block">
                                    <div className="w-2/3 h-full bg-rose-400 rounded-full" />
                                </div>
                            </div>
                            <span className="text-[10px] font-medium opacity-80 ml-2 font-mono tracking-wider">12:45 / 19:20</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/10 hidden sm:block border border-white/10 uppercase tracking-wider">1080p HD</span>
                            <Maximize className="w-4 h-4 cursor-pointer hover:text-rose-400 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Info */}
            <div className="p-6 relative z-10 bg-gradient-to-b from-transparent to-[#0B0F19]">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-medium mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Interactive Lesson
                </div>
                <h3 className="text-lg font-bold text-white mb-1 leading-tight tracking-tight">Advanced User Interface Design</h3>
                <p className="text-white/50 text-xs mb-5 font-medium tracking-wide">Module 4: Mastering Glassmorphism & Depth</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop"
                        alt="Instructor"
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                    />
                    <div className="flex flex-col">
                        <span className="text-white text-xs font-semibold block">Sarah Jenkins</span>
                        <span className="text-white/40 text-[10px] block uppercase tracking-wider">Lead Instructor</span>
                    </div>
                </div>
            </div>

            {/* Glowing orb behind */}
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-[60px] pointer-events-none" />
        </div>
    );
}
