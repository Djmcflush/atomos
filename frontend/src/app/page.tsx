"use client";

import React, { useState, useEffect } from 'react';
import AtomVisualization from '../components/AtomVisualization';
import AtomHealthBar from '../components/AtomHealthBar';
import { useAtom } from '../context/AtomContext';
import { elements } from '../utils/elements';

export default function Home() {
  const { atomProps, setAtomProps } = useAtom();
  const [loading, setLoading] = useState(true);
  const [atomId, setAtomId] = useState('');

  useEffect(() => {
    fetchLatestAtomData();
  }, []);

  const fetchLatestAtomData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/atom');
      if (!response.ok) {
        throw new Error('Failed to fetch atom data');
      }
      const data = await response.json();
      setAtomProps(data);
    } catch (error) {
      console.error('Error fetching atom data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAtomById = async () => {
    if (!atomId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/atom?id=${atomId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch atom data');
      }
      const data = await response.json();
      setAtomProps(data);
    } catch (error) {
      console.error('Error fetching atom data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'element') {
      const selectedElement = elements.find(el => el.name === value);
      if (selectedElement) {
        setAtomProps(prev => ({
          ...prev,
          protons: selectedElement.atomicNumber,
          electrons: selectedElement.atomicNumber,
          neutrons: Math.round(selectedElement.atomicNumber * 1.25) // Approximation
        }));
      }
    } else {
      setAtomProps(prev => ({ ...prev, [name]: parseInt(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = atomProps.id ? `/api/atom?id=${atomProps.id}` : '/api/atom';
      const method = atomProps.id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(atomProps),
      });
      if (!response.ok) {
        throw new Error('Failed to update atom data');
      }
      const data = await response.json();
      setAtomProps(prev => ({ ...prev, id: data.id }));
    } catch (error) {
      console.error('Error updating atom data:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] flex flex-col">
      <div className="sticky top-0 z-50 bg-gray-800 text-white p-4">
        <AtomHealthBar protons={atomProps.protons} neutrons={atomProps.neutrons} electrons={atomProps.electrons} />
      </div>
      <div className="flex-grow p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8">Atom Visualization</h1>
        <div className="mb-8">
          <input
            type="text"
            value={atomId}
            onChange={(e) => setAtomId(e.target.value)}
            placeholder="Enter Atom ID"
            className="p-2 border rounded mr-2"
          />
          <button onClick={fetchAtomById} className="p-2 bg-blue-500 text-white rounded mr-2">
            Fetch Atom
          </button>
          <button onClick={fetchLatestAtomData} className="p-2 bg-green-500 text-white rounded">
            Fetch Latest Atom
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
          <div className="bg-white p-6 rounded shadow">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">
                  Element:
                  <select
                    name="element"
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select an element</option>
                    {elements.map(element => (
                      <option key={element.atomicNumber} value={element.name}>
                        {element.name} ({element.symbol})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-2">
                  Protons:
                  <input
                    type="number"
                    name="protons"
                    value={atomProps.protons}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-2">
                  Neutrons:
                  <input
                    type="number"
                    name="neutrons"
                    value={atomProps.neutrons}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-2">
                  Electrons:
                  <input
                    type="number"
                    name="electrons"
                    value={atomProps.electrons}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </label>
              </div>
              <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
                {atomProps.id ? 'Update Atom' : 'Create New Atom'}
              </button>
            </form>
          </div>
          <div className="bg-white p-6 rounded shadow flex flex-col">
            <AtomVisualization {...atomProps} />
          </div>
        </div>
      </div>
    </div>
  );
}
