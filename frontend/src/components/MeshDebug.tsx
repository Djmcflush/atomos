import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    $3Dmol: any;
  }
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Viewer {
  addModel: () => void;
  addSphere: (spec: any) => void;
  addLine: (spec: any) => void;
  addCylinder: (spec: any) => void;
  zoomTo: () => void;
  render: () => void;
  clear: () => void;
}

const MeshDebug: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const viewerRef = useRef<Viewer | null>(null);

  const createComplexGrid = (viewer: Viewer, gridSize: number, sphereRadius: number) => {
    const colors = ['blue', 'green', 'white', 'cyan', 'magenta'];
    
    const distortionFactor = (x: number, y: number, z: number) => {
      const distance = Math.sqrt(x * x + y * y + z * z);
      return Math.max(0, (sphereRadius * sphereRadius) / (distance * distance) - 0.1);
    };

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const theta1 = (i / gridSize) * Math.PI * 2;
        const theta2 = ((i + 1) / gridSize) * Math.PI * 2;
        const phi1 = (j / gridSize) * Math.PI;
        const phi2 = ((j + 1) / gridSize) * Math.PI;

        const color = colors[(i + j) % colors.length];

        for (let k = 0; k < 10; k++) {
          const t = k / 10;
          const x1 = Math.sin(phi1) * Math.cos(theta1 + t * (theta2 - theta1));
          const y1 = Math.sin(phi1) * Math.sin(theta1 + t * (theta2 - theta1));
          const z1 = Math.cos(phi1);

          const x2 = Math.sin(phi1 + (phi2 - phi1) * t) * Math.cos(theta1);
          const y2 = Math.sin(phi1 + (phi2 - phi1) * t) * Math.sin(theta1);
          const z2 = Math.cos(phi1 + (phi2 - phi1) * t);

          const dist1 = distortionFactor(x1, y1, z1);
          const dist2 = distortionFactor(x2, y2, z2);

          viewer.addCylinder({
            start: { x: x1 * (10 + dist1), y: y1 * (10 + dist1), z: z1 * (10 + dist1) },
            end: { x: x2 * (10 + dist2), y: y2 * (10 + dist2), z: z2 * (10 + dist2) },
            radius: 0.05,
            color: color,
            fromCap: 1,
            toCap: 1
          });
        }
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current) {
      console.error('Container ref is null');
      setError('Container ref is null');
      return;
    }

    if (typeof window.$3Dmol === 'undefined') {
      console.error('3Dmol is not available');
      setError('3Dmol is not available');
      return;
    }

    try {
      console.log('Initializing 3Dmol viewer');
      const viewer = window.$3Dmol.createViewer(containerRef.current, {
        backgroundColor: 'black',
      }) as Viewer;

      if (!viewer) {
        console.error('Failed to create 3Dmol viewer');
        setError('Failed to create 3Dmol viewer');
        return;
      }

      viewerRef.current = viewer;

      viewer.addModel();

      // Add central glowing sphere
      const sphereRadius = 5; // Increased size
      viewer.addSphere({
        center: {x: 0, y: 0, z: 0},
        radius: sphereRadius,
        color: 'yellow',
        opacity: 1.0 // Full opacity
      });

      // Add outer glow effect
      for (let i = 0; i < 5; i++) {
        viewer.addSphere({
          center: {x: 0, y: 0, z: 0},
          radius: sphereRadius + 0.2 * (i + 1),
          color: 'orange',
          opacity: 0.2 - 0.03 * i
        });
      }

      // Create complex grid
      createComplexGrid(viewer, 20, sphereRadius);

      viewer.zoomTo();
      viewer.render();
      console.log('Viewer rendered');

      // Add subtle animation
      let time = 0;
      const animate = () => {
        time += 0.02;
        viewer.clear();
        
        // Re-add central glowing sphere
        viewer.addSphere({
          center: {x: 0, y: 0, z: 0},
          radius: sphereRadius + Math.sin(time) * 0.2,
          color: 'yellow',
          opacity: 1.0
        });

        // Re-add outer glow effect
        for (let i = 0; i < 5; i++) {
          viewer.addSphere({
            center: {x: 0, y: 0, z: 0},
            radius: sphereRadius + 0.2 * (i + 1) + Math.sin(time + i) * 0.1,
            color: 'orange',
            opacity: 0.2 - 0.03 * i
          });
        }
        
        createComplexGrid(viewer, 20, sphereRadius);
        
        viewer.render();
        requestAnimationFrame(animate);
      };
      animate();

    } catch (err) {
      console.error('Error in MeshDebug:', err);
      setError(`Error in MeshDebug: ${err}`);
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}></div>
      {error && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '10px', backgroundColor: 'red', color: 'white' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default MeshDebug;
