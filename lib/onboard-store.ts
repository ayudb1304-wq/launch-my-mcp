import { create } from "zustand";
import type { GeneratedTool } from "@/lib/mcp/generator";

export type OnboardStep = "describe" | "review" | "deploy";

interface EditableTool extends GeneratedTool {
  enabled: boolean;
}

interface OnboardState {
  step: OnboardStep;
  // Step 1: Describe
  name: string;
  description: string;
  websiteUrl: string;
  // Step 2: Review
  slug: string;
  tools: EditableTool[];
  isGenerating: boolean;
  generateError: string | null;
  // Step 3: Deploy
  isSaving: boolean;
  saveError: string | null;
  projectId: string | null;

  // Actions
  setStep: (step: OnboardStep) => void;
  setDescribe: (data: {
    name: string;
    description: string;
    websiteUrl: string;
  }) => void;
  setGenerating: (loading: boolean) => void;
  setGenerateError: (error: string | null) => void;
  setGeneratedTools: (tools: GeneratedTool[], slug: string) => void;
  toggleTool: (index: number) => void;
  updateToolDescription: (index: number, description: string) => void;
  setSlug: (slug: string) => void;
  setSaving: (loading: boolean) => void;
  setSaveError: (error: string | null) => void;
  setProjectId: (id: string) => void;
  reset: () => void;
}

const initialState = {
  step: "describe" as OnboardStep,
  name: "",
  description: "",
  websiteUrl: "",
  slug: "",
  tools: [] as EditableTool[],
  isGenerating: false,
  generateError: null,
  isSaving: false,
  saveError: null,
  projectId: null,
};

export const useOnboardStore = create<OnboardState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setDescribe: (data) =>
    set({ name: data.name, description: data.description, websiteUrl: data.websiteUrl }),

  setGenerating: (isGenerating) => set({ isGenerating, generateError: null }),

  setGenerateError: (generateError) =>
    set({ generateError, isGenerating: false }),

  setGeneratedTools: (tools, slug) =>
    set({
      tools: tools.map((t) => ({ ...t, enabled: true })),
      slug,
      isGenerating: false,
      step: "review",
    }),

  toggleTool: (index) =>
    set((state) => {
      const tools = [...state.tools];
      tools[index] = { ...tools[index], enabled: !tools[index].enabled };
      return { tools };
    }),

  updateToolDescription: (index, description) =>
    set((state) => {
      const tools = [...state.tools];
      tools[index] = { ...tools[index], description };
      return { tools };
    }),

  setSlug: (slug) => set({ slug }),

  setSaving: (isSaving) => set({ isSaving, saveError: null }),

  setSaveError: (saveError) => set({ saveError, isSaving: false }),

  setProjectId: (projectId) =>
    set({ projectId, isSaving: false, step: "deploy" }),

  reset: () => set(initialState),
}));
