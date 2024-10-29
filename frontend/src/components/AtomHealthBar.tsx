import React from 'react';

interface AtomHealthBarProps {
  protons?: number;
  neutrons?: number;
  electrons?: number;
}

const AtomHealthBar: React.FC<AtomHealthBarProps> = ({ protons, neutrons, electrons }) => {
  return (
    <div className="bg-gray-800 text-green-400 p-2 font-mono text-sm">
      <div className="max-w-3xl mx-auto flex justify-between items-center">
        <div>PROTONS: {protons !== undefined ? protons.toString().padStart(3, '0') : '---'}</div>
        <div>NEUTRONS: {neutrons !== undefined ? neutrons.toString().padStart(3, '0') : '---'}</div>
        <div>ELECTRONS: {electrons !== undefined ? electrons.toString().padStart(3, '0') : '---'}</div>
      </div>
    </div>
  );
};

export default AtomHealthBar;
