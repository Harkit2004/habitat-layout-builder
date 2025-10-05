export type PortType = 'hab-port' | 'svc-port' | 'std-port' | 'airlock-port';

export interface Port {
  id: string;
  type: PortType;
  position: 'north' | 'south' | 'east' | 'west' | 'top' | 'bottom';
  x: number; // relative to module
  y: number; // relative to module
}

export interface MainModule {
  id: string;
  name: string;
  shortName: string;
  width: number; // meters
  depth: number; // meters
  height: number; // meters
  volume: number; // m³ internal volume
  category: 'habitat' | 'service' | 'hygiene' | 'galley' | 'wardroom' | 'exercise' | 'medical' | 'maintenance' | 'logistics' | 'storage' | 'research' | 'external';
  color: string;
  ports: Port[];
  allowedSubModules: string[]; // IDs of allowed sub-modules
  maxConnections?: number; // optional limit on connections
}

export const mainModules: MainModule[] = [
  {
    id: 'habitat-container',
    name: 'Habitat Container',
    shortName: 'Habitat',
    width: 4.0,
    depth: 4.0,
    height: 2.5,
    volume: 40.0,
    category: 'habitat',
    color: '#4A90E2',
    ports: [
      { id: 'hab-n', type: 'hab-port', position: 'north', x: 2.0, y: 0 },
      { id: 'hab-s', type: 'hab-port', position: 'south', x: 2.0, y: 4.0 },
      { id: 'hab-e', type: 'std-port', position: 'east', x: 4.0, y: 2.0 },
      { id: 'hab-w', type: 'std-port', position: 'west', x: 0, y: 2.0 },
    ],
    allowedSubModules: ['bed', 'desk', 'lavatory', 'sensor', 'locker'],
    maxConnections: 4
  },
  {
    id: 'service-module',
    name: 'Service Module',
    shortName: 'Service',
    width: 2.5,
    depth: 2.0,
    height: 2.5,
    volume: 12.5,
    category: 'service',
    color: '#50C878',
    ports: [
      { id: 'svc-n', type: 'svc-port', position: 'north', x: 1.25, y: 0 },
      { id: 'svc-s', type: 'svc-port', position: 'south', x: 1.25, y: 2.0 },
      { id: 'svc-e', type: 'std-port', position: 'east', x: 2.5, y: 1.0 },
    ],
    allowedSubModules: ['toilet', 'lavatory', 'sensor'],
    maxConnections: 3
  },
  {
    id: 'hygiene-module',
    name: 'Hygiene Module',
    shortName: 'Hygiene',
    width: 2.0,
    depth: 2.0,
    height: 2.5,
    volume: 10.0,
    category: 'hygiene',
    color: '#5FD392',
    ports: [
      { id: 'hyg-n', type: 'svc-port', position: 'north', x: 1.0, y: 0 },
      { id: 'hyg-s', type: 'std-port', position: 'south', x: 1.0, y: 2.0 },
    ],
    allowedSubModules: ['shower', 'lavatory', 'sensor'],
    maxConnections: 2
  },
  {
    id: 'galley-module',
    name: 'Galley Module',
    shortName: 'Galley',
    width: 3.0,
    depth: 2.5,
    height: 2.0,
    volume: 15.0,
    category: 'galley',
    color: '#F39C12',
    ports: [
      { id: 'gal-n', type: 'std-port', position: 'north', x: 1.5, y: 0 },
      { id: 'gal-e', type: 'std-port', position: 'east', x: 3.0, y: 1.25 },
      { id: 'gal-w', type: 'std-port', position: 'west', x: 0, y: 1.25 },
    ],
    allowedSubModules: ['galley-equipment', 'lavatory', 'locker'],
    maxConnections: 3
  },
  {
    id: 'wardroom-module',
    name: 'Wardroom / Dining Module',
    shortName: 'Wardroom',
    width: 3.5,
    depth: 3.0,
    height: 2.0,
    volume: 21.0,
    category: 'wardroom',
    color: '#F5A623',
    ports: [
      { id: 'ward-n', type: 'std-port', position: 'north', x: 1.75, y: 0 },
      { id: 'ward-s', type: 'std-port', position: 'south', x: 1.75, y: 3.0 },
      { id: 'ward-e', type: 'std-port', position: 'east', x: 3.5, y: 1.5 },
    ],
    allowedSubModules: ['dining-table', 'locker', 'sensor'],
    maxConnections: 3
  },
  {
    id: 'exercise-module',
    name: 'Exercise Module',
    shortName: 'Exercise',
    width: 3.0,
    depth: 3.0,
    height: 2.5,
    volume: 22.5,
    category: 'exercise',
    color: '#E74C3C',
    ports: [
      { id: 'ex-n', type: 'std-port', position: 'north', x: 1.5, y: 0 },
      { id: 'ex-s', type: 'std-port', position: 'south', x: 1.5, y: 3.0 },
    ],
    allowedSubModules: ['treadmill', 'cycle', 'ared', 'sensor'],
    maxConnections: 2
  },
  {
    id: 'medical-module',
    name: 'Medical Module',
    shortName: 'Medical',
    width: 3.0,
    depth: 2.5,
    height: 2.5,
    volume: 18.75,
    category: 'medical',
    color: '#1ABC9C',
    ports: [
      { id: 'med-n', type: 'std-port', position: 'north', x: 1.5, y: 0 },
      { id: 'med-e', type: 'std-port', position: 'east', x: 3.0, y: 1.25 },
    ],
    allowedSubModules: ['medical-bed', 'control-panel', 'locker'],
    maxConnections: 2
  },
  {
    id: 'maintenance-module',
    name: 'Maintenance / Workbench Module',
    shortName: 'Maintenance',
    width: 2.5,
    depth: 2.5,
    height: 2.5,
    volume: 15.625,
    category: 'maintenance',
    color: '#95A5A6',
    ports: [
      { id: 'maint-n', type: 'std-port', position: 'north', x: 1.25, y: 0 },
      { id: 'maint-s', type: 'std-port', position: 'south', x: 1.25, y: 2.5 },
    ],
    allowedSubModules: ['workbench', 'control-panel', 'locker'],
    maxConnections: 2
  },
  {
    id: 'logistics-module',
    name: 'Logistics / Airlock Module',
    shortName: 'Logistics',
    width: 2.5,
    depth: 2.5,
    height: 2.5,
    volume: 15.625,
    category: 'logistics',
    color: '#7F8C8D',
    ports: [
      { id: 'log-n', type: 'airlock-port', position: 'north', x: 1.25, y: 0 },
      { id: 'log-e', type: 'std-port', position: 'east', x: 2.5, y: 1.25 },
    ],
    allowedSubModules: ['logistics-rack', 'locker'],
    maxConnections: 2
  },
  {
    id: 'storage-module',
    name: 'Storage Module',
    shortName: 'Storage',
    width: 2.0,
    depth: 2.5,
    height: 2.5,
    volume: 12.5,
    category: 'storage',
    color: '#34495E',
    ports: [
      { id: 'stor-n', type: 'std-port', position: 'north', x: 1.0, y: 0 },
      { id: 'stor-s', type: 'std-port', position: 'south', x: 1.0, y: 2.5 },
    ],
    allowedSubModules: ['locker', 'logistics-rack'],
    maxConnections: 2
  },
  {
    id: 'research-module',
    name: 'Research / Lab Module',
    shortName: 'Research',
    width: 3.5,
    depth: 3.0,
    height: 2.5,
    volume: 26.25,
    category: 'research',
    color: '#8E44AD',
    ports: [
      { id: 'res-n', type: 'std-port', position: 'north', x: 1.75, y: 0 },
      { id: 'res-e', type: 'std-port', position: 'east', x: 3.5, y: 1.5 },
      { id: 'res-w', type: 'std-port', position: 'west', x: 0, y: 1.5 },
    ],
    allowedSubModules: ['desk', 'workbench', 'control-panel'],
    maxConnections: 3
  },
  {
    id: 'external-module',
    name: 'External / Structure Module',
    shortName: 'Structure',
    width: 2.0,
    depth: 2.0,
    height: 2.0,
    volume: 0, // structural only
    category: 'external',
    color: '#2C3E50',
    ports: [
      { id: 'ext-n', type: 'std-port', position: 'north', x: 1.0, y: 0 },
      { id: 'ext-s', type: 'std-port', position: 'south', x: 1.0, y: 2.0 },
      { id: 'ext-e', type: 'std-port', position: 'east', x: 2.0, y: 1.0 },
      { id: 'ext-w', type: 'std-port', position: 'west', x: 0, y: 1.0 },
    ],
    allowedSubModules: [],
    maxConnections: 4
  }
];

export const canPortsConnect = (port1Type: PortType, port2Type: PortType): boolean => {
  if (port1Type === port2Type) return true;
  if (port1Type === 'std-port' || port2Type === 'std-port') return true;
  if ((port1Type === 'hab-port' && port2Type === 'svc-port') || 
      (port1Type === 'svc-port' && port2Type === 'hab-port')) return true;
  return false;
};
