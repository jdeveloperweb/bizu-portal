"use client";

import { useState } from "react";
import {
    Settings, Timer, Bell, BookOpen, BarChart3,
    Palette, Shield, Monitor, Smartphone, ChevronRight,
    Save, RotateCcw, CheckCircle2, Moon, Sun,
    Eye, Volume2,
} from "lucide-react";

interface SettingsSection {
    id: string;
    label: string;
    icon: typeof Settings;
}

const sections: SettingsSection[] = [
    { id: "pomodoro", label: "Pomodoro", icon: Timer },
    { id: "estudos", label: "Estudos", icon: BookOpen },
    { id: "notificacoes", label: "Notificacoes", icon: Bell },
    { id: "ranking", label: "Ranking", icon: BarChart3 },
    { id: "aparencia", label: "Aparencia", icon: Palette },
    { id: "privacidade", label: "Privacidade", icon: Shield },
];

const SUBJECTS = [
    "Direito Constitucional", "Direito Administrativo", "Direito Civil",
    "Direito Penal", "Processo Civil", "Processo Penal",
    "Lingua Portuguesa", "Raciocinio Logico",
];

export default function ConfiguracoesPage() {
    const [activeSection, setActiveSection] = useState("pomodoro");
    const [saved, setSaved] = useState(false);

    // Pomodoro settings
    const [focusTime, setFocusTime] = useState(25);
    const [shortBreak, setShortBreak] = useState(5);
    const [longBreak, setLongBreak] = useState(15);
    const [longBreakInterval, setLongBreakInterval] = useState(4);
    const [autoStartBreak, setAutoStartBreak] = useState(true);
    const [autoStartFocus, setAutoStartFocus] = useState(false);
    const [pomodoroSound, setPomodoroSound] = useState(true);

    // Study settings
    const [dailyGoal, setDailyGoal] = useState(50);
    const [weeklySimulados, setWeeklySimulados] = useState(2);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>(SUBJECTS.slice(0, 5));
    const [questionDifficulty, setQuestionDifficulty] = useState<"mista" | "facil" | "media" | "dificil">("mista");
    const [showResolution, setShowResolution] = useState(true);

    // Notification settings
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [studyReminder, setStudyReminder] = useState(true);
    const [reminderTime, setReminderTime] = useState("09:00");
    const [weeklyReport, setWeeklyReport] = useState(true);
    const [taskReminders, setTaskReminders] = useState(true);
    const [achievementNotif, setAchievementNotif] = useState(true);

    // Ranking settings
    const [rankingType, setRankingType] = useState<"geral" | "materia" | "semanal">("geral");
    const [showInRanking, setShowInRanking] = useState(true);
    const [showRealName, setShowRealName] = useState(false);

    // Appearance
    const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
    const [compactMode, setCompactMode] = useState(false);

    const toggleSubject = (s: string) => {
        setSelectedSubjects(prev =>
            prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s]
        );
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
        <button onClick={() => onChange(!enabled)}
            className={`w-10 h-[22px] rounded-full transition-all relative ${
                enabled ? "bg-indigo-500" : "bg-slate-200"
            }`}>
            <div className={`w-[18px] h-[18px] rounded-full bg-white shadow-sm absolute top-[2px] transition-all ${
                enabled ? "left-[20px]" : "left-[2px]"
            }`} />
        </button>
    );

    const Slider = ({ value, onChange, min, max, step = 1, unit = "" }: {
        value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string;
    }) => (
        <div className="flex items-center gap-3">
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-md" />
            <span className="text-[13px] font-bold text-slate-900 w-16 text-right">{value}{unit}</span>
        </div>
    );

    return (
        <div className="p-6 lg:p-8 max-w-[1000px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.15em]">Sistema</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                        Configuracoes
                    </h1>
                    <p className="text-sm text-slate-500">Ajuste o comportamento do app ao seu estilo de estudo.</p>
                </div>
                <button onClick={handleSave}
                    className={`btn-primary !h-10 !text-[12px] !px-5 ${saved ? "!bg-emerald-500" : ""}`}>
                    {saved ? <><CheckCircle2 size={15} /> Salvo!</> : <><Save size={15} /> Salvar Alteracoes</>}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <div className="card-elevated !rounded-2xl p-2 hover:!transform-none">
                        {sections.map(section => {
                            const Icon = section.icon;
                            const active = activeSection === section.id;
                            return (
                                <button key={section.id} onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all ${
                                        active
                                            ? "bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 font-bold"
                                            : "text-slate-500 hover:bg-slate-50"
                                    }`}>
                                    <Icon size={15} className={active ? "text-indigo-600" : "text-slate-400"} />
                                    {section.label}
                                    {active && <ChevronRight size={11} className="ml-auto text-indigo-400" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3 space-y-5">
                    {/* Pomodoro Settings */}
                    {activeSection === "pomodoro" && (
                        <>
                            <div className="card-elevated !rounded-2xl p-6 hover:!transform-none">
                                <h3 className="text-[15px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                                    <Timer size={16} className="text-indigo-500" /> Tempos do Pomodoro
                                </h3>
                                <p className="text-[12px] text-slate-400 mb-6">Configure a duracao dos ciclos de foco e pausa.</p>

                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[12px] font-bold text-slate-700 mb-2 block">Tempo de Foco</label>
                                        <Slider value={focusTime} onChange={setFocusTime} min={5} max={90} step={5} unit=" min" />
                                    </div>
                                    <div>
                                        <label className="text-[12px] font-bold text-slate-700 mb-2 block">Pausa Curta</label>
                                        <Slider value={shortBreak} onChange={setShortBreak} min={1} max={30} step={1} unit=" min" />
                                    </div>
                                    <div>
                                        <label className="text-[12px] font-bold text-slate-700 mb-2 block">Pausa Longa</label>
                                        <Slider value={longBreak} onChange={setLongBreak} min={5} max={45} step={5} unit=" min" />
                                    </div>
                                    <div>
                                        <label className="text-[12px] font-bold text-slate-700 mb-2 block">Ciclos ate Pausa Longa</label>
                                        <Slider value={longBreakInterval} onChange={setLongBreakInterval} min={2} max={8} step={1} />
                                    </div>
                                </div>
                            </div>

                            <div className="card-elevated !rounded-2xl p-6 hover:!transform-none">
                                <h3 className="text-[15px] font-bold text-slate-800 mb-5">Comportamento</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-[13px] font-medium text-slate-700">Iniciar pausa automaticamente</div>
                                            <div className="text-[11px] text-slate-400">A pausa comeca assim que o foco terminar</div>
                                        </div>
                                        <Toggle enabled={autoStartBreak} onChange={setAutoStartBreak} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-[13px] font-medium text-slate-700">Iniciar foco automaticamente</div>
                                            <div className="text-[11px] text-slate-400">O foco comeca assim que a pausa terminar</div>
                                        </div>
                                        <Toggle enabled={autoStartFocus} onChange={setAutoStartFocus} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-[13px] font-medium text-slate-700">Som de alerta</div>
                                            <div className="text-[11px] text-slate-400">Toque sonoro ao fim de cada ciclo</div>
                                        </div>
                                        <Toggle enabled={pomodoroSound} onChange={setPomodoroSound} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Study Settings */}
                    {activeSection === "estudos" && (
                        <>
                            <div className="card-elevated !rounded-2xl p-6 hover:!transform-none">
                                <h3 className="text-[15px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                                    <BookOpen size={16} className="text-indigo-500" /> Metas de Estudo
                                </h3>
                                <p className="text-[12px] text-slate-400 mb-6">Defina suas metas diarias e semanais.</p>

                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[12px] font-bold text-slate-700 mb-2 block">Meta diaria de questoes</label>
                                        <Slider value={dailyGoal} onChange={setDailyGoal} min={10} max={200} step={10} unit=" questoes" />
                                    </div>
                                    <div>
                                        <label className="text-[12px] font-bold text-slate-700 mb-2 block">Simulados por semana</label>
                                        <Slider value={weeklySimulados} onChange={setWeeklySimulados} min={1} max={7} step={1} />
                                    </div>
                                    <div>
                                        <label className="text-[12px] font-bold text-slate-700 mb-2 block">Dificuldade preferida</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {(["mista", "facil", "media", "dificil"] as const).map(d => (
                                                <button key={d} onClick={() => setQuestionDifficulty(d)}
                                                    className={`py-2.5 rounded-xl text-[12px] font-bold border-2 transition-all capitalize ${
                                                        questionDifficulty === d
                                                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                                                    }`}>
                                                    {d === "facil" ? "Facil" : d === "media" ? "Media" : d === "dificil" ? "Dificil" : "Mista"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-[13px] font-medium text-slate-700">Mostrar resolucao apos responder</div>
                                            <div className="text-[11px] text-slate-400">Exibir explicacao detalhada apos cada questao</div>
                                        </div>
                                        <Toggle enabled={showResolution} onChange={setShowResolution} />
                                    </div>
                                </div>
                            </div>

                            <div className="card-elevated !rounded-2xl p-6 hover:!transform-none">
                                <h3 className="text-[15px] font-bold text-slate-800 mb-5">Materias de Interesse</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {SUBJECTS.map(s => (
                                        <button key={s} onClick={() => toggleSubject(s)}
                                            className={`flex items-center gap-2 py-2.5 px-3 rounded-xl text-[12px] font-medium border transition-all ${
                                                selectedSubjects.includes(s)
                                                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                                                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                                            }`}>
                                            <CheckCircle2 size={14} className={selectedSubjects.includes(s) ? "text-indigo-500" : "text-slate-300"} />
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Notification Settings */}
                    {activeSection === "notificacoes" && (
                        <div className="card-elevated !rounded-2xl p-6 hover:!transform-none">
                            <h3 className="text-[15px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                                <Bell size={16} className="text-indigo-500" /> Notificacoes
                            </h3>
                            <p className="text-[12px] text-slate-400 mb-6">Controle como e quando receber lembretes.</p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[13px] font-medium text-slate-700">Notificacoes por e-mail</div>
                                        <div className="text-[11px] text-slate-400">Receber atualizacoes importantes por e-mail</div>
                                    </div>
                                    <Toggle enabled={emailNotifications} onChange={setEmailNotifications} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[13px] font-medium text-slate-700">Lembrete de estudo diario</div>
                                        <div className="text-[11px] text-slate-400">Receber lembrete para estudar</div>
                                    </div>
                                    <Toggle enabled={studyReminder} onChange={setStudyReminder} />
                                </div>
                                {studyReminder && (
                                    <div className="ml-8 flex items-center gap-3">
                                        <label className="text-[12px] text-slate-500">Horario:</label>
                                        <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)}
                                            className="input-field !w-auto !h-9 text-[12px]" />
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[13px] font-medium text-slate-700">Relatorio semanal</div>
                                        <div className="text-[11px] text-slate-400">Resumo do seu progresso toda segunda-feira</div>
                                    </div>
                                    <Toggle enabled={weeklyReport} onChange={setWeeklyReport} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[13px] font-medium text-slate-700">Lembretes de tarefas</div>
                                        <div className="text-[11px] text-slate-400">Avisar sobre tarefas com prazo proximo</div>
                                    </div>
                                    <Toggle enabled={taskReminders} onChange={setTaskReminders} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[13px] font-medium text-slate-700">Conquistas e badges</div>
                                        <div className="text-[11px] text-slate-400">Notificar ao desbloquear conquistas</div>
                                    </div>
                                    <Toggle enabled={achievementNotif} onChange={setAchievementNotif} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ranking Settings */}
                    {activeSection === "ranking" && (
                        <div className="card-elevated !rounded-2xl p-6 hover:!transform-none">
                            <h3 className="text-[15px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                                <BarChart3 size={16} className="text-indigo-500" /> Ranking
                            </h3>
                            <p className="text-[12px] text-slate-400 mb-6">Configure como voce aparece e visualiza o ranking.</p>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-[12px] font-bold text-slate-700 mb-2 block">Ranking padrao</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {([
                                            { key: "geral" as const, label: "Geral" },
                                            { key: "materia" as const, label: "Por Materia" },
                                            { key: "semanal" as const, label: "Semanal" },
                                        ]).map(r => (
                                            <button key={r.key} onClick={() => setRankingType(r.key)}
                                                className={`py-2.5 rounded-xl text-[12px] font-bold border-2 transition-all ${
                                                    rankingType === r.key
                                                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                                                }`}>
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[13px] font-medium text-slate-700">Aparecer no ranking publico</div>
                                        <div className="text-[11px] text-slate-400">Outros usuarios podem ver sua posicao</div>
                                    </div>
                                    <Toggle enabled={showInRanking} onChange={setShowInRanking} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[13px] font-medium text-slate-700">Mostrar nome real</div>
                                        <div className="text-[11px] text-slate-400">Exibir seu nome completo ou apenas iniciais</div>
                                    </div>
                                    <Toggle enabled={showRealName} onChange={setShowRealName} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Settings */}
                    {activeSection === "aparencia" && (
                        <div className="card-elevated !rounded-2xl p-6 hover:!transform-none">
                            <h3 className="text-[15px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                                <Palette size={16} className="text-indigo-500" /> Aparencia
                            </h3>
                            <p className="text-[12px] text-slate-400 mb-6">Personalize a aparencia do aplicativo.</p>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-[12px] font-bold text-slate-700 mb-3 block">Tema</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {([
                                            { key: "light" as const, label: "Claro", icon: Sun },
                                            { key: "dark" as const, label: "Escuro", icon: Moon },
                                            { key: "auto" as const, label: "Automatico", icon: Monitor },
                                        ]).map(t => {
                                            const Icon = t.icon;
                                            return (
                                                <button key={t.key} onClick={() => setTheme(t.key)}
                                                    className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                                                        theme === t.key
                                                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                                                    }`}>
                                                    <Icon size={20} />
                                                    <span className="text-[11px] font-bold">{t.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[13px] font-medium text-slate-700">Modo compacto</div>
                                        <div className="text-[11px] text-slate-400">Reduzir espacamento para ver mais conteudo</div>
                                    </div>
                                    <Toggle enabled={compactMode} onChange={setCompactMode} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Privacy Settings */}
                    {activeSection === "privacidade" && (
                        <div className="card-elevated !rounded-2xl p-6 hover:!transform-none">
                            <h3 className="text-[15px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                                <Shield size={16} className="text-indigo-500" /> Privacidade
                            </h3>
                            <p className="text-[12px] text-slate-400 mb-6">Gerencie suas configuracoes de privacidade.</p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[13px] font-medium text-slate-700">Perfil publico</div>
                                        <div className="text-[11px] text-slate-400">Permitir que outros vejam seu perfil</div>
                                    </div>
                                    <Toggle enabled={showInRanking} onChange={setShowInRanking} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[13px] font-medium text-slate-700">Compartilhar desempenho no grupo</div>
                                        <div className="text-[11px] text-slate-400">Mostrar seu progresso para membros do grupo</div>
                                    </div>
                                    <Toggle enabled={showRealName} onChange={setShowRealName} />
                                </div>
                            </div>

                            <div className="mt-8 p-4 rounded-xl bg-red-50 border border-red-100">
                                <h4 className="text-[13px] font-bold text-red-700 mb-1">Zona de Perigo</h4>
                                <p className="text-[11px] text-red-500 mb-3">Acoes irreversiveis. Tenha cuidado.</p>
                                <div className="flex items-center gap-2">
                                    <button className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-600 border border-red-200 hover:bg-red-100 transition-all">
                                        Exportar meus dados
                                    </button>
                                    <button className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-600 border border-red-200 hover:bg-red-100 transition-all">
                                        Excluir conta
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
