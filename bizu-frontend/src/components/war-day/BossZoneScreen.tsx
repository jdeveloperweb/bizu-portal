"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowLeft, Zap, Skull, Star, ChevronRight, Flame } from "lucide-react";
import { WarDayService, QuestionResponse, AnswerResult, ZoneState } from "@/lib/warDayService";
import ZoneConquestAnimation from "./ZoneConquestAnimation";

interface BossZoneScreenProps {
  eventId: string;
  zone: ZoneState;
  onBack: () => void;
  onBossDefeated: (result: AnswerResult) => void;
}

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

function BossHealthBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.max(0, (1 - current / max) * 100) : 0; // HP depletes as you answer

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Skull size={20} className="text-red-400" />
          <span className="font-bold text-red-400">CHEFE</span>
        </div>
        <span className="text-xs text-gray-400 font-mono">
          HP: {max - current} / {max}
        </span>
      </div>
      <div className="h-4 rounded-full overflow-hidden" style={{ background: "rgba(255,0,0,0.15)", border: "1px solid rgba(248,113,113,0.3)" }}>
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            background: "linear-gradient(90deg, #7F1D1D, #EF4444, #F87171)",
            width: `${100 - pct}%`,
          }}
          animate={{ width: `${100 - pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default function BossZoneScreen({ eventId, zone, onBack, onBossDefeated }: BossZoneScreenProps) {
  const [phase, setPhase] = useState<"loading" | "question" | "feedback" | "defeated" | "error">("loading");
  const [question, setQuestion] = useState<QuestionResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [showConquest, setShowConquest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenShake, setScreenShake] = useState(false);

  const required = Math.ceil(zone.questionCount * 0.7);

  const loadQuestion = useCallback(async () => {
    try {
      setPhase("loading");
      setSelectedOption(null);
      setResult(null);
      const q = await WarDayService.getQuestion(eventId, zone.zoneId);
      if (q.zoneStatus === "CONQUERED") {
        setPhase("defeated");
        return;
      }
      setQuestion(q);
      setPhase("question");
    } catch (e: any) {
      if (e.message?.includes("conquistada")) {
        setPhase("defeated");
      } else {
        setError(e.message ?? "Erro ao carregar questão");
        setPhase("error");
      }
    }
  }, [eventId, zone.zoneId]);

  useEffect(() => { loadQuestion(); }, [loadQuestion]);

  const handleAnswer = useCallback(async (option: string) => {
    if (!question || selectedOption !== null) return;
    setSelectedOption(option);
    setPhase("feedback");

    try {
      const res = await WarDayService.submitAnswer(eventId, zone.zoneId, question.questionId, option);
      setResult(res);

      if (!res.correct) {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 600);
      }

      if (res.zoneConquered) {
        setTimeout(() => setShowConquest(true), 800);
      }
    } catch (e: any) {
      setError(e.message ?? "Erro ao enviar resposta");
    }
  }, [question, selectedOption, eventId, zone.zoneId]);

  const options = question?.options
    ? Object.entries(question.options).map(([key, value]) => ({ key, value: String(value) }))
    : [];

  return (
    <motion.div
      className="flex flex-col min-h-[100dvh] relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at top, #3B0000 0%, #0A0010 50%, #050810 100%)", color: "white" }}
      animate={screenShake ? {
        x: [-6, 6, -5, 5, -3, 3, 0],
        y: [0, -3, 3, -2, 2, 0],
      } : {}}
      transition={{ duration: 0.4 }}
    >
      {/* Boss atmosphere particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: "#F87171",
              left: `${10 + i * 11}%`,
              top: "100%",
              opacity: 0.6,
            }}
            animate={{
              y: [0, -(Math.random() * 400 + 200)],
              x: [0, (Math.random() - 0.5) * 60],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              repeatDelay: Math.random() * 3,
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 z-10 relative"
        style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(248,113,113,0.2)" }}>
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-red-300 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Flame size={20} className="text-red-400" />
          <span className="font-black text-red-400 uppercase tracking-wider text-sm">
            {zone.name}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/50 text-red-300 border border-red-500/30">
            Boss Final
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Star key={i} size={12} fill="#F87171" color="#F87171" />
          ))}
        </div>
      </div>

      {/* Boss HP bar */}
      {question && (
        <div className="px-4 py-3 z-10 relative" style={{ background: "rgba(0,0,0,0.4)" }}>
          <BossHealthBar current={question.correctAnswers} max={required} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto overscroll-none z-10 relative">
      <div className="flex flex-col items-center justify-start px-4 py-5 pb-8 max-w-2xl mx-auto w-full min-h-full">
        <AnimatePresence mode="wait">
          {phase === "loading" && (
            <motion.div key="loading" className="text-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.2)", border: "2px solid #EF4444" }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Skull size={36} className="text-red-400" />
              </motion.div>
              <p className="text-red-300 font-semibold">O chefe está se preparando...</p>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div key="error" className="text-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={loadQuestion}
                className="px-6 py-2 bg-red-800 rounded-xl text-white font-semibold hover:bg-red-700 transition-colors">
                Tentar novamente
              </button>
            </motion.div>
          )}

          {phase === "defeated" && (
            <motion.div key="defeated" className="text-center"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <motion.div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(248,113,113,0.2)", border: "2px solid #F87171" }}
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Skull size={44} className="text-red-400" />
              </motion.div>
              <h2 className="text-3xl font-black text-red-400 mb-2">Chefe Derrotado!</h2>
              <p className="text-gray-400 mb-6">Sua guild venceu o boss!</p>
              <button onClick={onBack}
                className="px-8 py-3 rounded-xl font-bold text-white bg-red-800 hover:bg-red-700 transition-colors">
                Voltar ao Mapa
              </button>
            </motion.div>
          )}

          {(phase === "question" || phase === "feedback") && question && (
            <motion.div key="boss-battle" className="w-full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Question card */}
              <div className="rounded-2xl p-4 sm:p-6 mb-5"
                style={{
                  background: "rgba(127,29,29,0.15)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  boxShadow: "inset 0 0 40px rgba(248,113,113,0.05)",
                }}>
                {question.imageBase64 && (
                  <img src={`data:image/png;base64,${question.imageBase64}`} alt=""
                    className="w-full rounded-lg mb-4 max-h-48 object-contain" />
                )}
                <p className="text-white text-base leading-relaxed whitespace-pre-wrap">
                  {question.statement}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {options.map(({ key, value }, idx) => {
                  const isSelected = selectedOption === key;
                  const isCorrect = result?.correctAnswer === key;
                  const isWrong = isSelected && result && !result.correct;
                  const showAnswer = phase === "feedback" && result;

                  return (
                    <motion.button
                      key={key}
                      className="w-full flex items-start gap-3 p-4 rounded-xl text-left font-medium transition-all"
                      style={{
                        background: showAnswer
                          ? isCorrect ? "rgba(74,222,128,0.12)" : isWrong ? "rgba(248,113,113,0.12)" : "rgba(255,255,255,0.03)"
                          : "rgba(255,255,255,0.05)",
                        border: showAnswer
                          ? isCorrect ? "1px solid #4ADE8050" : isWrong ? "1px solid #F8717150" : "1px solid rgba(255,255,255,0.06)"
                          : "1px solid rgba(248,113,113,0.2)",
                        cursor: phase === "feedback" ? "default" : "pointer",
                      }}
                      onClick={() => phase === "question" && handleAnswer(key)}
                      whileHover={phase === "question" ? { scale: 1.01, borderColor: "#F87171" } : {}}
                      whileTap={phase === "question" ? { scale: 0.99 } : {}}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                    >
                      <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{
                          background: showAnswer && isCorrect ? "#4ADE80" : showAnswer && isWrong ? "#F87171" : "rgba(248,113,113,0.2)",
                          color: "white",
                        }}>
                        {OPTION_LABELS[idx] ?? key}
                      </span>
                      <span className="flex-1 text-sm text-gray-200">{value}</span>
                      {showAnswer && isCorrect && <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />}
                      {showAnswer && isWrong && <XCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {phase === "feedback" && result && (
                  <motion.div
                    className="mt-5 rounded-2xl p-5"
                    style={{
                      background: result.correct ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
                      border: `1px solid ${result.correct ? "#4ADE8030" : "#F8717130"}`,
                    }}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={`font-bold ${result.correct ? "text-emerald-400" : "text-red-400"}`}>
                        {result.correct ? "⚔️ Golpe certeiro!" : "💀 O chefe contra-atacou!"}
                      </p>
                      {result.correct && (
                        <div className="flex items-center gap-1 text-yellow-400 font-bold">
                          <Zap size={14} fill="#FBBF24" />
                          +{result.pointsEarned} pts
                        </div>
                      )}
                    </div>
                    {result.resolution && (
                      <p className="text-sm text-gray-300 leading-relaxed">{result.resolution}</p>
                    )}

                    {!result.zoneConquered && (
                      <button onClick={loadQuestion}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-red-800 text-white hover:bg-red-700 transition-all hover:scale-105">
                        Continuar o ataque
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>

      <ZoneConquestAnimation
        zoneName={zone.name}
        zoneType="BOSS"
        pointsEarned={result?.pointsEarned ?? 0}
        show={showConquest}
        onDone={() => {
          setShowConquest(false);
          if (result) onBossDefeated(result);
        }}
      />
    </motion.div>
  );
}
