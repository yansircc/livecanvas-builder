import { create } from "zustand";

interface AdviceStore {
	handleAdviceClick: ((advice: string) => void) | null;
	setHandleAdviceClick: (handler: (advice: string) => void) => void;
}

export const useAdviceStore = create<AdviceStore>((set) => ({
	handleAdviceClick: null,
	setHandleAdviceClick: (handler) => set({ handleAdviceClick: handler }),
}));
