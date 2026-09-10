import { create } from "zustand";

export type Quality = "low" | "medium" | "high";

type AppState = {
  quality: Quality;
  accent: string;
  setQuality: (quality: Quality) => void;
  setAccent: (accent: string) => void;

  // Team selection state
  leftTeamCode: string;
  rightTeamCode: string;
  setLeftTeamCode: (code: string) => void;
  setRightTeamCode: (code: string) => void;

  // Score state
  leftGoals: number;
  rightGoals: number;
  scored: (side: "left" | "right") => void;
  resetScore: () => void;

  // Aiming state
  isAiming: boolean;
  aimPower: number; // 0-1
  aimDirection: { x: number; z: number }; // normalized vector in XZ plane
  setAiming: (aiming: boolean) => void;
  setAimPower: (power: number) => void;
  setAimDirection: (direction: { x: number; z: number }) => void;

  // Ball state
  ballPosition: [number, number, number];
  ballVelocity: [number, number, number];
  setBallPosition: (pos: [number, number, number]) => void;
  setBallVelocity: (vel: [number, number, number]) => void;
  resetBall: () => void;

  // Goal flash state
  showGoalFlash: boolean;
  setShowGoalFlash: (show: boolean) => void;

  // Hero frame-capture mode: true for the whole capture session (set once at
  // the start, cleared once at the end) so the HUD/hero overlay hide/show
  // declaratively instead of racy per-frame DOM manipulation.
  isCapturingFrames: boolean;
  setCapturingFrames: (capturing: boolean) => void;
};

const BALL_START_POS: [number, number, number] = [0, 0.11, 0];
const AIM_RESET = { x: 0, z: -1 }; // looking downfield (negative Z)

export const useAppStore = create<AppState>((set) => ({
  quality: "high",
  accent: "#c4a574",
  setQuality: (quality) => set({ quality }),
  setAccent: (accent) => set({ accent }),

  leftTeamCode: "ARG",
  rightTeamCode: "BRA",
  setLeftTeamCode: (code) => set({ leftTeamCode: code }),
  setRightTeamCode: (code) => set({ rightTeamCode: code }),

  leftGoals: 0,
  rightGoals: 0,
  scored: (side) =>
    set((s) => ({
      leftGoals: side === "left" ? s.leftGoals + 1 : s.leftGoals,
      rightGoals: side === "right" ? s.rightGoals + 1 : s.rightGoals,
      showGoalFlash: true,
    })),
  resetScore: () => set({ leftGoals: 0, rightGoals: 0 }),

  isAiming: false,
  aimPower: 0,
  aimDirection: { ...AIM_RESET },
  setAiming: (aiming) =>
    set({
      isAiming: aiming,
      aimPower: aiming ? 0 : 0,
      aimDirection: aiming ? { ...AIM_RESET } : { ...AIM_RESET },
    }),
  setAimPower: (power) => set({ aimPower: Math.max(0, Math.min(1, power)) }),
  setAimDirection: (direction) => set({ aimDirection: direction }),

  ballPosition: [...BALL_START_POS],
  ballVelocity: [0, 0, 0],
  setBallPosition: (pos) => set({ ballPosition: pos }),
  setBallVelocity: (vel) => set({ ballVelocity: vel }),
  resetBall: () =>
    set({
      ballPosition: [...BALL_START_POS],
      ballVelocity: [0, 0, 0],
      isAiming: false,
      aimPower: 0,
      aimDirection: { ...AIM_RESET },
    }),

  showGoalFlash: false,
  setShowGoalFlash: (show) => set({ showGoalFlash: show }),

  isCapturingFrames: false,
  setCapturingFrames: (capturing) => set({ isCapturingFrames: capturing }),
}));
