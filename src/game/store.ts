import { create } from "zustand";
import { TOTAL } from "./data";

type Dialogue = { npcId: string; line: number } | null;

type GameState = {
  started: boolean;
  soundOn: boolean;
  complete: boolean;
  showObjective: boolean;
  talked: string[];
  nearId: string | null;
  dialogue: Dialogue;

  start: () => void;
  setNear: (id: string | null) => void;
  openDialogue: (id: string) => void;
  nextLine: (totalLines: number) => void;
  toggleSound: () => void;
  toggleObjective: () => void;
  closeComplete: () => void;
  reset: () => void;
};

export const useGame = create<GameState>((set, get) => ({
  started: false,
  soundOn: false,
  complete: false,
  showObjective: true,
  talked: [],
  nearId: null,
  dialogue: null,

  start: () => set({ started: true }),

  setNear: (id) => {
    if (get().nearId !== id) set({ nearId: id });
  },

  openDialogue: (id) => {
    const s = get();
    if (!s.started || s.dialogue) return;
    set({ dialogue: { npcId: id, line: 0 } });
  },

  nextLine: (totalLines) => {
    const d = get().dialogue;
    if (!d) return;
    if (d.line + 1 >= totalLines) {
      const talked = get().talked.includes(d.npcId)
        ? get().talked
        : [...get().talked, d.npcId];
      set({ dialogue: null, talked, complete: talked.length >= TOTAL });
    } else {
      set({ dialogue: { npcId: d.npcId, line: d.line + 1 } });
    }
  },

  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  toggleObjective: () => set((s) => ({ showObjective: !s.showObjective })),
  closeComplete: () => set({ complete: false }),
  reset: () => set({ talked: [], complete: false, dialogue: null }),
}));
