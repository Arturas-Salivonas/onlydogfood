'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  filters: {
    search: string;
    category: string;
    breedSize: string;
    lifeStage: string;
    sortBy: string;
    priceRange: [number, number];
  };
  comparisonItems: string[]; // Product IDs
}

type UIAction =
  | { type: 'SET_THEME'; payload: UIState['theme'] }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_FILTERS'; payload: Partial<UIState['filters']> }
  | { type: 'RESET_FILTERS' }
  | { type: 'ADD_TO_COMPARISON'; payload: string }
  | { type: 'REMOVE_FROM_COMPARISON'; payload: string }
  | { type: 'CLEAR_COMPARISON' };

const initialState: UIState = {
  theme: 'system',
  sidebarOpen: false,
  filters: {
    search: '',
    category: '',
    breedSize: '',
    lifeStage: '',
    sortBy: 'score-desc',
    priceRange: [0, 200],
  },
  comparisonItems: [],
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialState.filters,
      };
    case 'ADD_TO_COMPARISON':
      if (state.comparisonItems.length >= 4) return state; // Max 4 items
      if (state.comparisonItems.includes(action.payload)) return state;
      return {
        ...state,
        comparisonItems: [...state.comparisonItems, action.payload],
      };
    case 'REMOVE_FROM_COMPARISON':
      return {
        ...state,
        comparisonItems: state.comparisonItems.filter(id => id !== action.payload),
      };
    case 'CLEAR_COMPARISON':
      return { ...state, comparisonItems: [] };
    default:
      return state;
  }
}

const UIContext = createContext<{
  state: UIState;
  dispatch: React.Dispatch<UIAction>;
} | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ui-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Apply saved preferences
        if (parsed.theme) dispatch({ type: 'SET_THEME', payload: parsed.theme });
        if (parsed.filters) dispatch({ type: 'SET_FILTERS', payload: parsed.filters });
        if (parsed.comparisonItems) {
          parsed.comparisonItems.forEach((id: string) => {
            dispatch({ type: 'ADD_TO_COMPARISON', payload: id });
          });
        }
      } catch (error) {
        console.warn('Failed to parse saved UI state:', error);
      }
    }

    // Load comparison from sessionStorage
    const comparison = sessionStorage.getItem('comparison-items');
    if (comparison) {
      try {
        const items = JSON.parse(comparison);
        items.forEach((id: string) => {
          dispatch({ type: 'ADD_TO_COMPARISON', payload: id });
        });
      } catch (error) {
        console.warn('Failed to parse comparison items:', error);
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    const toSave = {
      theme: state.theme,
      filters: state.filters,
    };
    localStorage.setItem('ui-state', JSON.stringify(toSave));
  }, [state.theme, state.filters]);

  // Save comparison to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('comparison-items', JSON.stringify(state.comparisonItems));
  }, [state.comparisonItems]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const effectiveTheme = state.theme === 'system' ? systemTheme : state.theme;

    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
  }, [state.theme]);

  return (
    <UIContext.Provider value={{ state, dispatch }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

// Convenience hooks
export function useTheme() {
  const { state, dispatch } = useUI();
  return {
    theme: state.theme,
    setTheme: (theme: UIState['theme']) => dispatch({ type: 'SET_THEME', payload: theme }),
  };
}

export function useFilters() {
  const { state, dispatch } = useUI();
  return {
    filters: state.filters,
    setFilters: (filters: Partial<UIState['filters']>) => dispatch({ type: 'SET_FILTERS', payload: filters }),
    resetFilters: () => dispatch({ type: 'RESET_FILTERS' }),
  };
}

export function useComparison() {
  const { state, dispatch } = useUI();
  return {
    items: state.comparisonItems,
    addItem: (id: string) => dispatch({ type: 'ADD_TO_COMPARISON', payload: id }),
    removeItem: (id: string) => dispatch({ type: 'REMOVE_FROM_COMPARISON', payload: id }),
    clearItems: () => dispatch({ type: 'CLEAR_COMPARISON' }),
    hasItem: (id: string) => state.comparisonItems.includes(id),
    canAddMore: state.comparisonItems.length < 4,
  };
}



