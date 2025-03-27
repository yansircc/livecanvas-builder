import { create } from "zustand";

interface AdviceState {
	handleAdviceClick: ((advice: string) => void) | null;
	setHandleAdviceClick: (handler: (advice: string) => void) => void;
}

export const useAdviceStore = create<AdviceState>((set) => ({
	handleAdviceClick: null,
	setHandleAdviceClick: (handler) => set({ handleAdviceClick: handler }),
}));
