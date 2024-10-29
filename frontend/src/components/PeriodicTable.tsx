import React from 'react';

const elements = [
  { symbol: 'H', name: 'Hydrogen', atomicNumber: 1 },
  { symbol: 'He', name: 'Helium', atomicNumber: 2 },
  { symbol: 'Li', name: 'Lithium', atomicNumber: 3 },
  { symbol: 'Be', name: 'Beryllium', atomicNumber: 4 },
  { symbol: 'B', name: 'Boron', atomicNumber: 5 },
  { symbol: 'C', name: 'Carbon', atomicNumber: 6 },
  { symbol: 'N', name: 'Nitrogen', atomicNumber: 7 },
  { symbol: 'O', name: 'Oxygen', atomicNumber: 8 },
  { symbol: 'F', name: 'Fluorine', atomicNumber: 9 },
  { symbol: 'Ne', name: 'Neon', atomicNumber: 10 },
  // Add all other elements here...
  { symbol: 'Og', name: 'Oganesson', atomicNumber: 118 },
];

const PeriodicTable: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {elements.map((element) => (
        <div key={element.atomicNumber} className="border p-2 rounded">
          <div className="font-bold">{element.symbol}</div>
          <div>{element.name}</div>
          <div>Atomic Number: {element.atomicNumber}</div>
        </div>
      ))}
    </div>
  );
};

export default PeriodicTable;
