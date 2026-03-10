"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Sword, Shield, ArrowLeft, Zap, Target, ChevronRight } from "lucide-react";
import { WarDayService, QuestionResponse, AnswerResult, ZoneState } from "@/lib/warDayService";
import ZoneConquestAnimation from "./ZoneConquestAnimation";

interface ZoneBattleScreenProps {
  eventId: string;
  zone: ZoneState;
  onBack: () => void;
  onZoneConquered: (result: AnswerResult) => void;
}

type BattlePhase = "loading" | "question" | "feedback" | "conquered" | "error";

const DIFFICULTY_COLORS = {
  EASY:   { label: "Fácil",    color: "#4ADE80", bg: "rgba(74,222,128,0.1)" },
  MEDIUM: { label: "Médio",    color: "#FBBF24", bg: "rgba(251,191,36,0.1)" },
  HARD:   { label: "Difícil",  color: "#F87171", bg: "rgba(248,113,113,0.1)" },
  null:   { label: "Normal",   color: "#818CF8", bg: "rgba(129,140,248,0.1)" },
};

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

export default function ZoneBattleScreen({ eventId, zone, onBack, onZoneConquered }: ZoneBattleScreenProps) {
  const [phase, setPhase] = useState<BattlePhase>("loading");
  const [question, setQuestion] = useState<QuestionResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [showConquest, setShowConquest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  const zoneColors: Record<string, string> = {
    CAMP: "#F59E0B", WATCHTOWER: "#22D3EE",
    FORTRESS: "#A78BFA", CASTLE: "#C084FC", BOSS: "#F87171",
  };
  const zoneColor = zoneColors[zone.zoneType] ?? "#6366F1";

  const loadQuestion = useCallback(async () => {
    try {
      setPhase("loading");
      setSelectedOption(null);
      setResult(null);
      const q = await WarDayService.getQuestion(eventId, zone.zoneId);
      setQuestion(q);
      setTimer(30);
      setTimerActive(true);
      setPhase("question");
    } catch (e: any) {
      if (e.message?.includes("conquistada")) {
        setPhase("conquered");
      } else {
        setError(e.message ?? "Erro ao carregar questão");
        setPhase("error");
      }
    }
  }, [eventId, zone.zoneId]);

  useEffect(() => { loadQuestion(); }, [loadQuestion]);

  // Timer
  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setTimerActive(false);
          // Auto-submit wrong on timeout
          handleAnswer("TIMEOUT");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  const handleAnswer = useCallback(async (option: string) => {
    if (!question || selectedOption !== null) return;
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(option);
    setPhase("feedback");

    try {
      const res = await WarDayService.submitAnswer(eventId, zone.zoneId, question.questionId, option);
      setResult(res);

      if (res.zoneConquered) {
        setTimeout(() => setShowConquest(true), 600);
      }
    } catch (e: any) {
      setError(e.message ?? "Erro ao enviar resposta");
    }
  }, [question, selectedOption, eventId, zone.zoneId]);

  const options = question?.options
    ? Object.entries(question.options).map(([key, value]) => ({ key, value: String(value) }))
    : [];

  const diffConfig = DIFFICULTY_COLORS[(question?.difficulty ?? "null") as keyof typeof DIFFICULTY_COLORS]
    ?? DIFFICULTY_COLORS.null;

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        background: "radial-gradient(ellipse at top, #1a0a2e 0%, #050810 60%)",
        color: "white",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-white/10"
        style={{ background: "rgba(0,0,0,0.4)" }}>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Mapa</span>
        </button>

        <div className="flex-1 flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: `${zoneColor}22`, border: `1px solid ${zoneColor}` }}>
            <Sword size={14} color={zoneColor} />
          </div>
          <span className="font-bold text-sm truncate">{zone.name}</span>
        </div>

        {/* Progress */}
        {question && (
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Target size={14} className="text-indigo-400" />
              <span className="text-gray-300">
                {question.correctAnswers} / {Math.ceil(question.questionCount * 0.7)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {question && (
        <div className="h-1 bg-white/10">
          <motion.div
            className="h-full"
            style={{ background: zoneColor }}
            animate={{ width: `${(question.correctAnswers / Math.ceil(question.questionCount * 0.7)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === "loading" && (
            <motion.div key="loading" className="flex flex-col items-center gap-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-gray-400">Preparando questão...</p>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div key="error" className="text-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={loadQuestion}
                className="px-6 py-2 bg-indigo-600 rounded-xl text-white font-semibold hover:bg-indigo-500 transition-colors">
                Tentar novamente
              </button>
            </motion.div>
          )}

          {phase === "conquered" && (
            <motion.div key="conquered" className="text-center"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(74,222,128,0.2)", border: "2px solid #4ADE80" }}>
                <Shield size={40} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-400 mb-2">Zona Conquistada!</h2>
              <p className="text-gray-400 mb-6">Sua guild já domina esta zona.</p>
              <button onClick={onBack}
                className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors">
                Voltar ao Mapa
              </button>
            </motion.div>
          )}

          {(phase === "question" || phase === "feedback") && question && (
            <motion.div key="battle" className="w-full"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

              {/* Timer bar */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full transition-colors"
                    style={{
                      background: timer > 15 ? "#4ADE80" : timer > 8 ? "#FBBF24" : "#F87171",
                      width: `${(timer / 30) * 100}%`,
                      transition: "width 1s linear",
                    }}
                  />
                </div>
                <span className={`text-sm font-mono font-bold w-8 text-right ${timer <= 8 ? "text-red-400" : "text-gray-400"}`}>
                  {timer}s
                </span>
              </div>

              {/* Difficulty & question number */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: diffConfig.bg, color: diffConfig.color }}>
                  {diffConfig.label}
                </span>
                <span className="text-xs text-gray-500">
                  Questão #{question.questionsAnswered + 1}
                </span>
              </div>

              {/* Question */}
              <div className="rounded-2xl p-6 mb-6"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {question.imageBase64 && (
                  <img
                    src={`data:image/png;base64,${question.imageBase64}`}
                    alt="Imagem da questão"
                    className="w-full rounded-lg mb-4 max-h-48 object-contain"
                  />
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
                      className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all font-medium"
                      style={{
                        background: showAnswer
                          ? isCorrect
                            ? "rgba(74,222,128,0.15)"
                            : isWrong
                            ? "rgba(248,113,113,0.15)"
                            : "rgba(255,255,255,0.03)"
                          : isSelected
                          ? "rgba(99,102,241,0.15)"
                          : "rgba(255,255,255,0.04)",
                        border: showAnswer
                          ? isCorrect
                            ? "1px solid #4ADE80"
                            : isWrong
                            ? "1px solid #F87171"
                            : "1px solid rgba(255,255,255,0.06)"
                          : isSelected
                          ? "1px solid #6366F1"
                          : "1px solid rgba(255,255,255,0.08)",
                        cursor: phase === "feedback" ? "default" : "pointer",
                      }}
                      onClick={() => phase === "question" && handleAnswer(key)}
                      whileHover={phase === "question" ? { scale: 1.01 } : {}}
                      whileTap={phase === "question" ? { scale: 0.99 } : {}}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.07 }}
                    >
                      <span
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{
                          background: showAnswer && isCorrect ? "#4ADE80" : showAnswer && isWrong ? "#F87171" : "rgba(255,255,255,0.1)",
                          color: showAnswer && (isCorrect || isWrong) ? "white" : "#94A3B8",
                        }}
                      >
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
                    className="mt-6 rounded-2xl p-5"
                    style={{
                      background: result.correct
                        ? "rgba(74,222,128,0.1)"
                        : "rgba(248,113,113,0.1)",
                      border: `1px solid ${result.correct ? "#4ADE8040" : "#F8717140"}`,
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start gap-3">
                      {result.correct
                        ? <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        : <XCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className={`font-bold ${result.correct ? "text-emerald-400" : "text-red-400"}`}>
                            {result.correct ? "Resposta correta!" : "Resposta incorreta"}
                          </p>
                          {result.correct && (
                            <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                              <Zap size={14} fill="#FBBF24" />
                              +{result.pointsEarned} pts
                            </div>
                          )}
                        </div>
                        {result.resolution && (
                          <p className="text-sm text-gray-300 leading-relaxed">{result.resolution}</p>
                        )}
                      </div>
                    </div>

                    {!result.zoneConquered && (
                      <button
                        onClick={loadQuestion}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
                        style={{ background: zoneColor, color: "black" }}
                      >
                        Próxima questão
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

      {/* Zone conquest animation */}
      <ZoneConquestAnimation
        zoneName={zone.name}
        zoneType={zone.zoneType}
        pointsEarned={result?.pointsEarned ?? 0}
        show={showConquest}
        onDone={() => {
          setShowConquest(false);
          if (result) onZoneConquered(result);
        }}
      />
    </div>
  );
}
