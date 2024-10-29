"use client";

import React, { useEffect, useState } from 'react';
import MeshDebug from '../../components/MeshDebug';

export default function DebugPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [windowSize, setWindowSize] = useState('N/A');
  const [is3DmolAvailable, setIs3DmolAvailable] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setWindowSize(`${window.innerWidth}x${window.innerHeight}`);
    setIs3DmolAvailable(typeof window.$3Dmol !== 'undefined');

    const handleResize = () => {
      setWindowSize(`${window.innerWidth}x${window.innerHeight}`);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-semibold mb-6 text-center">Mesh Debug Visualization</h1>
            <div className="bg-gray-200 rounded-lg relative" style={{ width: '100%', height: '400px', overflow: 'hidden' }}>
              {isMounted ? (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                  <MeshDebug />
                </div>
              ) : (
                <p className="text-center py-4">Loading MeshDebug component...</p>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Debug Info:</p>
              <ul>
                <li>Component Mounted: {isMounted ? 'Yes' : 'No'}</li>
                <li>Window Size: {windowSize}</li>
                <li>3Dmol Available: {is3DmolAvailable ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
