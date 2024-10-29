"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AtomProps {
  id: number | null;
  electrons: number;
  neutrons: number;
  protons: number;
}

interface AtomContextType {
  atomProps: AtomProps;
  setAtomProps: React.Dispatch<React.SetStateAction<AtomProps>>;
}

const AtomContext = createContext<AtomContextType | undefined>(undefined);

export const AtomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [atomProps, setAtomProps] = useState<AtomProps>({ id: null, electrons: 1, neutrons: 0, protons: 1 });

  return (
    <AtomContext.Provider value={{ atomProps, setAtomProps }}>
      {children}
    </AtomContext.Provider>
  );
};

export const useAtom = () => {
  const context = useContext(AtomContext);
  if (context === undefined) {
    throw new Error('useAtom must be used within an AtomProvider');
  }
  return context;
};
