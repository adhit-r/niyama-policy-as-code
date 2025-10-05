import { create } from 'zustand';

interface PolicyDetails {
  name: string;
  description: string;
  category: string;
  severity: string;
  language: string;
  tags: string[];
  accessLevel: string;
}

interface TestResult {
  decision: string;
  reason: string;
  details?: any;
}

interface PolicyEditorState {
  policyCode: string;
  policyDetails: PolicyDetails;
  isSaving: boolean;
  isTesting: boolean;
  testResult: TestResult | null;
  testInput: string;
  saveMessage: string | null;
  isFullscreen: boolean;
  showPreview: boolean;
  activeTab: 'code' | 'test' | 'results';
  sidebarCollapsed: boolean;

  setPolicyCode: (code: string) => void;
  setPolicyDetails: (details: Partial<PolicyDetails>) => void;
  setIsSaving: (isSaving: boolean) => void;
  setIsTesting: (isTesting: boolean) => void;
  setTestResult: (result: TestResult | null) => void;
  setTestInput: (input: string) => void;
  setSaveMessage: (message: string | null) => void;
  setIsFullscreen: (isFullscreen: boolean) => void;
  setShowPreview: (showPreview: boolean) => void;
  setActiveTab: (tab: 'code' | 'test' | 'results') => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  reset: () => void;
}

const initialState = {
    policyCode: '',
    policyDetails: {
        name: '',
        description: '',
        category: 'Security',
        severity: 'Medium',
        language: 'rego',
        tags: [],
        accessLevel: 'private'
    },
    isSaving: false,
    isTesting: false,
    testResult: null,
    testInput: '{\n  "kind": "Pod",\n  "spec": {\n    "securityContext": {\n      "runAsNonRoot": true\n    }\n  }\n}',
    saveMessage: null,
    isFullscreen: false,
    showPreview: false,
    activeTab: 'code' as 'code' | 'test' | 'results',
    sidebarCollapsed: false,
}

export const usePolicyEditorStore = create<PolicyEditorState>((set) => ({
  ...initialState,
  setPolicyCode: (code) => set({ policyCode: code }),
  setPolicyDetails: (details) => set((state) => ({ policyDetails: { ...state.policyDetails, ...details } })),
  setIsSaving: (isSaving) => set({ isSaving }),
  setIsTesting: (isTesting) => set({ isTesting }),
  setTestResult: (result) => set({ testResult: result }),
  setTestInput: (input) => set({ testInput: input }),
  setSaveMessage: (message) => set({ saveMessage: message }),
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  setShowPreview: (showPreview) => set({ showPreview }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  reset: () => set(initialState),
}));
