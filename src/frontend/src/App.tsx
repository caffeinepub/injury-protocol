import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ─── Data model ───────────────────────────────────────────────────────────────

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

interface Exercise {
  id: string;
  name: string;
  prescription: string;
  hasRpe: boolean;
}

interface WorkoutDay {
  key: DayKey;
  label: string;
  full: string;
  type: string;
  isRest: boolean;
  exercises: Exercise[];
  sessionRpe?: boolean;
}

const WORKOUT_DAYS: WorkoutDay[] = [
  {
    key: "mon",
    label: "Mon",
    full: "MONDAY",
    type: "Lower",
    isRest: false,
    exercises: [
      {
        id: "goblet-squat",
        name: "Goblet Squat",
        prescription: "3 × 10",
        hasRpe: true,
      },
      {
        id: "kb-swings",
        name: "KB Swings",
        prescription: "3 × 15",
        hasRpe: true,
      },
      {
        id: "suitcase-carry",
        name: "Suitcase Carry",
        prescription: "3 × 30–45s / side",
        hasRpe: true,
      },
    ],
  },
  {
    key: "tue",
    label: "Tue",
    full: "TUESDAY",
    type: "Norwegian 4×4",
    isRest: false,
    sessionRpe: true,
    exercises: [
      {
        id: "warmup",
        name: "Warm-Up",
        prescription: "5 min easy",
        hasRpe: false,
      },
      {
        id: "4x4-intervals",
        name: "4 × Intervals",
        prescription: "4 min @ 90% HR  ·  3 min easy recovery",
        hasRpe: false,
      },
    ],
  },
  {
    key: "wed",
    label: "Wed",
    full: "WEDNESDAY",
    type: "KB Skills",
    isRest: false,
    exercises: [
      {
        id: "turkish-getup",
        name: "Turkish Get-Ups",
        prescription: "3 × 2–3 / side",
        hasRpe: true,
      },
      {
        id: "around-world",
        name: "Around the World",
        prescription: "3 × 10 each direction",
        hasRpe: true,
      },
      {
        id: "kb-halos",
        name: "KB Halos",
        prescription: "3 × 10 each direction",
        hasRpe: true,
      },
      { id: "planks", name: "Planks", prescription: "3 × 45s", hasRpe: false },
    ],
  },
  {
    key: "thu",
    label: "Thu",
    full: "THURSDAY",
    type: "Rest",
    isRest: true,
    exercises: [],
  },
  {
    key: "fri",
    label: "Fri",
    full: "FRIDAY",
    type: "Lower + Carries",
    isRest: false,
    exercises: [
      {
        id: "goblet-squat",
        name: "Goblet Squat",
        prescription: "3 × 10",
        hasRpe: true,
      },
      {
        id: "kb-swings",
        name: "KB Swings",
        prescription: "3 × 15",
        hasRpe: true,
      },
      {
        id: "suitcase-carry",
        name: "Suitcase Carry",
        prescription: "3 × 30–45s / side",
        hasRpe: true,
      },
    ],
  },
  {
    key: "sat",
    label: "Sat",
    full: "SATURDAY",
    type: "Easy Cardio",
    isRest: false,
    exercises: [
      {
        id: "zone2",
        name: "Zone 2",
        prescription: "Bike or walk 30–40 min at conversational pace",
        hasRpe: false,
      },
    ],
  },
  {
    key: "sun",
    label: "Sun",
    full: "SUNDAY",
    type: "Rest",
    isRest: true,
    exercises: [],
  },
];

// Map JS getDay() (0=Sun) to our DayKey index
const JS_DAY_TO_INDEX: Record<number, number> = {
  0: 6, // Sun → index 6
  1: 0, // Mon → index 0
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5, // Sat → index 5
};

// ─── RPE Button strip ─────────────────────────────────────────────────────────

interface RpeStripProps {
  exerciseId: string;
  rpeValues: Record<string, number>;
  onSelect: (id: string, val: number) => void;
  label?: string;
}

function RpeStrip({
  exerciseId,
  rpeValues,
  onSelect,
  label = "RPE",
}: RpeStripProps) {
  const selected = rpeValues[exerciseId] ?? 0;

  return (
    <div className="mt-4">
      <span className="text-xs font-body font-500 tracking-[0.2em] uppercase text-muted-foreground mb-2.5 block">
        {label}
      </span>
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
          const isSelected = selected === val;
          return (
            <motion.button
              key={val}
              type="button"
              data-ocid={`rpe.button.${val}`}
              onClick={() => onSelect(exerciseId, val)}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
              className={[
                // Base: 44px tap target, square with slight radius
                "w-11 h-11 rounded-lg text-base font-display font-700",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "transition-colors duration-100",
                isSelected
                  ? "rpe-selected"
                  : [
                      "border text-foreground/40",
                      "border-foreground/12 bg-foreground/[0.03]",
                      "hover:border-accent/60 hover:text-foreground/80 hover:bg-accent/8",
                    ].join(" "),
              ].join(" ")}
              aria-label={`RPE ${val}`}
              aria-pressed={isSelected}
            >
              {val}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Exercise card ────────────────────────────────────────────────────────────

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  rpeValues: Record<string, number>;
  onRpeSelect: (id: string, val: number) => void;
}

function ExerciseCard({
  exercise,
  index,
  rpeValues,
  onRpeSelect,
}: ExerciseCardProps) {
  return (
    <motion.div
      data-ocid={`exercise.item.${index}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.07 }}
      className="py-6 border-b border-border last:border-0"
    >
      {/* Exercise name — large, dominant */}
      <h3 className="font-display font-800 text-[1.75rem] leading-tight text-foreground tracking-tight">
        {exercise.name}
      </h3>

      {/* Prescription — promoted, readable */}
      <p className="font-body text-base text-foreground/60 mt-1.5 leading-snug">
        {exercise.prescription}
      </p>

      {exercise.hasRpe && (
        <RpeStrip
          exerciseId={exercise.id}
          rpeValues={rpeValues}
          onSelect={onRpeSelect}
        />
      )}
    </motion.div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const todayIndex = JS_DAY_TO_INDEX[new Date().getDay()] ?? 0;
  const [activeIndex, setActiveIndex] = useState<number>(todayIndex);

  // rpeValues keyed as `${dayKey}-${exerciseId}` for per-day isolation
  const [rpeValues, setRpeValues] = useState<Record<string, number>>({});

  const activeDay = WORKOUT_DAYS[activeIndex];

  function handleRpeSelect(exerciseId: string, val: number) {
    const key = `${activeDay.key}-${exerciseId}`;
    setRpeValues((prev) => {
      if (prev[key] === val) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: val };
    });
  }

  function getScopedRpe(): Record<string, number> {
    const prefix = `${activeDay.key}-`;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(rpeValues)) {
      if (k.startsWith(prefix)) {
        out[k.slice(prefix.length)] = v;
      }
    }
    return out;
  }

  const scopedRpe = getScopedRpe();
  const sessionRpeKey = `${activeDay.key}-session`;
  const sessionRpeValue = rpeValues[sessionRpeKey] ?? 0;

  function handleSessionRpe(val: number) {
    setRpeValues((prev) => {
      if (prev[sessionRpeKey] === val) {
        const next = { ...prev };
        delete next[sessionRpeKey];
        return next;
      }
      return { ...prev, [sessionRpeKey]: val };
    });
  }

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Outer centering wrapper */}
      <div className="mx-auto max-w-[480px] min-h-screen flex flex-col">
        {/* ── Header ── */}
        <header className="pt-10 pb-4 px-5">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-display font-800 text-5xl sm:text-6xl leading-none tracking-tighter uppercase text-foreground">
              Injury
              <br />
              Protocol
            </h1>
            <p className="font-display font-700 text-accent text-base mt-2 tracking-widest uppercase">
              8 Weeks
            </p>
          </motion.div>
        </header>

        {/* ── Day Picker ── */}
        <nav className="px-5 pb-3 pt-2" aria-label="Select training day">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {WORKOUT_DAYS.map((day, i) => {
              const isActive = i === activeIndex;
              const isToday = i === todayIndex;
              return (
                <button
                  key={day.key}
                  type="button"
                  data-ocid={`day.tab.${i + 1}`}
                  onClick={() => setActiveIndex(i)}
                  className={[
                    "flex-shrink-0 flex flex-col items-center",
                    // Taller pill with a bit more horizontal padding
                    "px-4 py-2.5 rounded-full",
                    "font-display font-700 text-sm tracking-wide",
                    "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    // Today dot suffix via utility
                    isToday && !isActive ? "today-dot" : "",
                    isActive
                      ? "bg-accent text-accent-foreground shadow-[0_0_10px_0_var(--rpe-glow)]"
                      : "bg-foreground/8 text-foreground/50 border border-foreground/8 hover:bg-foreground/12 hover:text-foreground/80",
                  ].join(" ")}
                  aria-pressed={isActive}
                  aria-current={isActive ? "page" : undefined}
                >
                  {day.label}
                  {/* Today indicator dot shown on inactive today pill */}
                  {isToday && !isActive && (
                    <span className="block w-1 h-1 rounded-full bg-accent mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ── Workout Content ── */}
        <main data-ocid="workout.section" className="flex-1 px-5 pt-4 pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay.key}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.2 }}
            >
              {/* Day heading */}
              <div className="mb-6 pb-5 border-b border-border">
                <h2 className="font-display font-800 text-4xl sm:text-5xl leading-none tracking-tighter uppercase text-foreground">
                  {activeDay.full}
                </h2>
                <p
                  className={[
                    "font-display font-700 text-sm mt-1.5 tracking-widest uppercase",
                    activeDay.isRest ? "text-foreground/30" : "text-accent",
                  ].join(" ")}
                >
                  {activeDay.type}
                </p>
              </div>

              {/* Rest day */}
              {activeDay.isRest ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <span className="font-display font-800 text-8xl sm:text-9xl tracking-tighter text-foreground/8 select-none">
                    REST
                  </span>
                  <p className="font-body text-foreground/35 text-sm">
                    Recovery is training.
                  </p>
                </div>
              ) : (
                <>
                  {/* Exercise list */}
                  <div>
                    {activeDay.exercises.map((ex, idx) => (
                      <ExerciseCard
                        key={`${activeDay.key}-${ex.id}`}
                        exercise={ex}
                        index={idx + 1}
                        rpeValues={scopedRpe}
                        onRpeSelect={handleRpeSelect}
                      />
                    ))}
                  </div>

                  {/* Session-level RPE (Tuesday) */}
                  {activeDay.sessionRpe && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="mt-6 pt-6 border-t border-border"
                    >
                      <h3 className="font-display font-800 text-2xl text-foreground tracking-tight">
                        Session RPE
                      </h3>
                      <p className="font-body text-sm text-foreground/50 mt-1 mb-1">
                        How hard was the overall 4×4 session?
                      </p>
                      <div className="flex gap-2 flex-wrap mt-3">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (val) => {
                            const isSelected = sessionRpeValue === val;
                            return (
                              <motion.button
                                key={val}
                                type="button"
                                data-ocid={`rpe.session.button.${val}`}
                                onClick={() => handleSessionRpe(val)}
                                whileTap={{ scale: 0.88 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 600,
                                  damping: 20,
                                }}
                                className={[
                                  "w-11 h-11 rounded-lg text-base font-display font-700",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                  "transition-colors duration-100",
                                  isSelected
                                    ? "rpe-selected"
                                    : [
                                        "border text-foreground/40",
                                        "border-foreground/12 bg-foreground/[0.03]",
                                        "hover:border-accent/60 hover:text-foreground/80 hover:bg-accent/8",
                                      ].join(" "),
                                ].join(" ")}
                                aria-label={`Session RPE ${val}`}
                                aria-pressed={isSelected}
                              >
                                {val}
                              </motion.button>
                            );
                          },
                        )}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Footer ── */}
        <footer className="px-5 py-4 border-t border-border text-center">
          <p className="text-xs text-foreground/30 font-body">
            © {new Date().getFullYear()}. Built with <span aria-hidden>♥</span>{" "}
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="underline underline-offset-2 hover:text-foreground/60 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
