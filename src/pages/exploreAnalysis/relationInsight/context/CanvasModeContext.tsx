import React, { createContext, useContext } from 'react';
import { DEFAULT_CANVAS_MODE } from '../constants';
import type { CanvasModeKey } from '../types';

const CanvasModeContext = createContext<CanvasModeKey>(DEFAULT_CANVAS_MODE);

export const CanvasModeProvider: React.FC<{
  mode: CanvasModeKey;
  children: React.ReactNode;
}> = ({ mode, children }) => (
  <CanvasModeContext.Provider value={mode}>
    {children}
  </CanvasModeContext.Provider>
);

export const useCanvasMode = () => useContext(CanvasModeContext);
