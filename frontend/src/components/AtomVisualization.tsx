import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    $3Dmol: any;
  }
}

interface AtomProps {
  electrons: number;
  neutrons: number;
  protons: number;
}

interface CustomShape {
  vertexArr: number[];
  faceArr: number[];
  normalArr: number[];
  color: string;
  opacity: number;
}

interface Quark {
  center: { x: number; y: number; z: number };
  radius: number;
  color: string;
  qcdColor: string;
}

interface Nucleon {
  center: { x: number; y: number; z: number };
  radius: number;
  color: string;
  quarks: Quark[];
}

const QCDColors = {
  quarkColors: ['red', 'green', 'blue'],
  antiQuarkColors: ['cyan', 'magenta', 'yellow'],
  gluonColors: [
    'red', 'blue',
    'green', 'blue',
    'blue', 'green',
    'red' , 'green',
    'green' ,'red'
  ]
};

const AtomVisualization: React.FC<AtomProps> = ({ electrons, neutrons, protons }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const calculateElectronConfiguration = (electronCount: number) => {
    const shells = [
      { name: '1s', capacity: 2 },
      { name: '2s', capacity: 2 },
      { name: '2p', capacity: 6 },
      { name: '3s', capacity: 2 },
      { name: '3p', capacity: 6 },
      { name: '4s', capacity: 2 },
      { name: '3d', capacity: 10 },
      { name: '4p', capacity: 6 },
    ];

    const configuration: { [key: string]: number } = {};
    let remainingElectrons = electronCount;

    for (const shell of shells) {
      if (remainingElectrons <= 0) break;
      const electronsInShell = Math.min(remainingElectrons, shell.capacity);
      configuration[shell.name] = electronsInShell;
      remainingElectrons -= electronsInShell;
    }

    return configuration;
  };

  const generateSphericalGrid = (radius: number, resolution: number) => {
    const points: number[][] = [];
    for (let i = 0; i < resolution; i++) {
      const theta = (i / resolution) * Math.PI * 2;
      for (let j = 0; j < resolution; j++) {
        const phi = (j / resolution) * Math.PI;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        points.push([x, y, z]);
      }
    }
    return points;
  };

  const applyOrbitalFunction = (points: number[][], shellName: string, electronCount: number, time: number) => {
    const shellNumber = Number(shellName[0]);
    const subshell = shellName[1];
    
    return points.map(([x, y, z]) => {
      let r = Math.sqrt(x*x + y*y + z*z);
      let theta = Math.atan2(y, x);
      let phi = Math.acos(z / r);

      let fluctuation = Math.sin(5 * theta + 7 * phi + time) * 0.3;
      
      if (subshell === 's') {
        fluctuation *= Math.exp(-r / shellNumber) * Math.sin(r * shellNumber + time);
      } else if (subshell === 'p') {
        fluctuation *= Math.exp(-r / shellNumber) * Math.cos(theta) * Math.sin(r * shellNumber + time);
      } else if (subshell === 'd') {
        fluctuation *= Math.exp(-r / shellNumber) * (3 * Math.cos(phi)*Math.cos(phi) - 1) * Math.sin(r * shellNumber + time);
      }

      fluctuation *= electronCount / 5;

      return [x * (1 + fluctuation), y * (1 + fluctuation), z * (1 + fluctuation)];
    });
  };

  const renderOrbital = (viewer: any, shellName: string, electronCount: number, time: number) => {
    const shellNumber = Number(shellName[0]);
    const shellRadius = shellNumber * 0.5; // Increased orbital size
    const resolution = 50;
    const basePoints = generateSphericalGrid(shellRadius, resolution);
    const fluctuatedPoints = applyOrbitalFunction(basePoints, shellName, electronCount, time);

    const shape: CustomShape = {
      vertexArr: fluctuatedPoints.flat(),
      faceArr: [],
      normalArr: [],
      color: `rgba(0, 191, 255, ${0.1 + (electronCount / 10)})`, // Adjusted color and opacity
      opacity: 0.7 // Increased opacity
    };

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const a = i * resolution + j;
        const b = i * resolution + (j + 1) % resolution;
        const c = ((i + 1) % resolution) * resolution + j;
        const d = ((i + 1) % resolution) * resolution + (j + 1) % resolution;

        shape.faceArr.push(a, b, c);
        shape.faceArr.push(b, d, c);
      }
    }

    for (let i = 0; i < fluctuatedPoints.length; i++) {
      const [x, y, z] = fluctuatedPoints[i];
      const length = Math.sqrt(x*x + y*y + z*z);
      shape.normalArr.push(x/length, y/length, z/length);
    }

    try {
      viewer.addCustom(shape);
    } catch (error) {
      console.error('Error adding custom shape:', error);
    }
  };

  const renderQuarks = (viewer: any, center: {x: number, y: number, z: number}, radius: number): Quark[] => {
    const quarkRadius = radius / 3;
    const quarks: Quark[] = [];

    for (let i = 0; i < 3; i++) {
      const phi = Math.acos(-1 + (2 * i) / 3);
      const theta = Math.sqrt(3 * Math.PI) * phi;

      const x = center.x + radius * 0.6 * Math.cos(theta) * Math.sin(phi);
      const y = center.y + radius * 0.6 * Math.sin(theta) * Math.sin(phi);
      const z = center.z + radius * 0.6 * Math.cos(phi);

      const quark: Quark = {
        center: { x, y, z },
        radius: quarkRadius,
        color: QCDColors.quarkColors[i],
        qcdColor: QCDColors.quarkColors[i],
      };

      quarks.push(quark);
      viewer.addSphere(quark);
    }

    return quarks;
  };

  const renderGluonExchange = (viewer: any, quark1: Quark, quark2: Quark, time: number) => {
    const gluonRadius = 0.01;
    const gluonSpeed = 0.2;

    const start = quark1.center;
    const end = quark2.center;

    const progress = (Math.sin(time * gluonSpeed) + 1) / 2;
    const x = start.x + (end.x - start.x) * progress;
    const y = start.y + (end.y - start.y) * progress;
    const z = start.z + (end.z - start.z) * progress;

    const gluonColor = QCDColors.gluonColors[Math.floor(Math.random() * QCDColors.gluonColors.length)];

    viewer.addSphere({
      center: { x, y, z },
      radius: gluonRadius,
      color: gluonColor,
    });
  };

  const renderNucleus = (viewer: any, protons: number, neutrons: number): Nucleon[] => {
    const nucleusRadius = 0.3;
    const nucleonRadius = 0.1;
    const nucleons: Nucleon[] = [];

    for (let i = 0; i < protons + neutrons; i++) {
      const phi = Math.acos(-1 + (2 * i) / (protons + neutrons));
      const theta = Math.sqrt((protons + neutrons) * Math.PI) * phi;

      const x = nucleusRadius * Math.cos(theta) * Math.sin(phi);
      const y = nucleusRadius * Math.sin(theta) * Math.sin(phi);
      const z = nucleusRadius * Math.cos(phi);

      const nucleon: Nucleon = {
        center: { x, y, z },
        radius: nucleonRadius,
        color: i < protons ? 'red' : 'blue',
        quarks: [],
      };

      viewer.addSphere(nucleon);
      nucleons.push(nucleon);

      // Render quarks for each nucleon
      nucleon.quarks = renderQuarks(viewer, nucleon.center, nucleonRadius);
    }

    return nucleons;
  };

  const renderMesonExchange = (viewer: any, nucleons: Nucleon[], time: number) => {
    const mesonRadius = 0.02;
    const mesonSpeed = 0.1;
    const exchangeProbability = 0.2;

    for (let i = 0; i < nucleons.length; i++) {
      for (let j = i + 1; j < nucleons.length; j++) {
        if (Math.random() < exchangeProbability) {
          const start = nucleons[i].center;
          const end = nucleons[j].center;

          const progress = (Math.sin(time * mesonSpeed) + 1) / 2;
          const x = start.x + (end.x - start.x) * progress;
          const y = start.y + (end.y - start.y) * progress;
          const z = start.z + (end.z - start.z) * progress;

          const quarkColor = QCDColors.quarkColors[Math.floor(Math.random() * QCDColors.quarkColors.length)];
          const antiQuarkColor = QCDColors.antiQuarkColors[QCDColors.quarkColors.indexOf(quarkColor)];
          const mesonColor = `${quarkColor}-${antiQuarkColor}`;

          viewer.addSphere({
            center: { x, y, z },
            radius: mesonRadius,
            color: mesonColor,
          });
        }
      }
    }
  };

  useEffect(() => {
    if (containerRef.current && typeof window.$3Dmol !== 'undefined') {
      const viewer = window.$3Dmol.createViewer(containerRef.current, {
        backgroundColor: 'white',
      });

      let time = 0;
      const animate = () => {
        viewer.clear();
        
        // Render nucleus with quarks
        const nucleons = renderNucleus(viewer, protons, neutrons);

        // Render meson exchange between nucleons
        renderMesonExchange(viewer, nucleons, time);

        // Render gluon exchange within nucleons
        nucleons.forEach(nucleon => {
          for (let i = 0; i < nucleon.quarks.length; i++) {
            for (let j = i + 1; j < nucleon.quarks.length; j++) {
              if (Math.random() < 0.3) { // 30% chance of gluon exchange
                renderGluonExchange(viewer, nucleon.quarks[i], nucleon.quarks[j], time);
              }
            }
          }
        });

        // Add electron orbitals
        const electronConfiguration = calculateElectronConfiguration(electrons);
        Object.entries(electronConfiguration).forEach(([orbital, count]) => {
          renderOrbital(viewer, orbital, count, time);
        });

        viewer.render();
        time += 0.1;
        requestAnimationFrame(animate);
      };

      animate();

      viewer.zoomTo();
      viewer.rotate(90);
      viewer.render();

      return () => {
        // Clean up animation on component unmount
        viewer.clear();
      };
    } else {
      console.error('3Dmol is not available or container not found');
    }
  }, [electrons, neutrons, protons]);

  const getAtomName = () => {
    const elements = [
      'Hydrogen', 'Helium', 'Lithium', 'Beryllium', 'Boron', 'Carbon', 'Nitrogen', 'Oxygen', 'Fluorine', 'Neon',
      'Sodium', 'Magnesium', 'Aluminum', 'Silicon', 'Phosphorus', 'Sulfur', 'Chlorine', 'Argon', 'Potassium', 'Calcium'
    ];
    return protons > 0 && protons <= elements.length ? elements[protons - 1] : 'Unknown';
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4">{getAtomName()} Atom Visualization</h2>
      <div className="flex-grow relative">
        <div ref={containerRef} className="absolute inset-0"></div>
      </div>
      <div className="mt-4">
        <p>Protons: {protons}</p>
        <p>Neutrons: {neutrons}</p>
        <p>Electrons: {electrons}</p>
      </div>
    </div>
  );
};

export default AtomVisualization;
