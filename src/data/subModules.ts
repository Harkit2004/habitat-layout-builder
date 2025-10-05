export type AnchorType = 'floor' | 'wall' | 'ceiling';

export interface SubModule {
  id: string;
  name: string;
  shortName: string;
  width: number; // meters
  depth: number; // meters
  height: number; // meters
  volume: number; // m³
  category: 'living' | 'hygiene' | 'dining' | 'exercise' | 'medical' | 'maintenance' | 'storage' | 'control';
  color: string;
  allowedAnchors: AnchorType[];
  zAware: boolean; // whether height matters for placement
}

export const subModules: SubModule[] = [
  {
    id: 'bed',
    name: 'Bed / Bunk',
    shortName: 'Bed',
    width: 2.00,
    depth: 1.45,
    height: 2.00,
    volume: 10.76,
    category: 'living',
    color: '#4A90E2',
    allowedAnchors: ['floor', 'wall'],
    zAware: true
  },
  {
    id: 'desk',
    name: 'Desk / Private Workstation',
    shortName: 'Desk',
    width: 2.02,
    depth: 0.98,
    height: 1.91,
    volume: 4.35,
    category: 'living',
    color: '#5C9FE8',
    allowedAnchors: ['floor', 'wall'],
    zAware: true
  },
  {
    id: 'toilet',
    name: 'Toilet Unit (UWMS)',
    shortName: 'Toilet',
    width: 0.65,
    depth: 0.67,
    height: 1.49,
    volume: 2.36,
    category: 'hygiene',
    color: '#50C878',
    allowedAnchors: ['floor'],
    zAware: true
  },
  {
    id: 'lavatory',
    name: 'Lavatory / Sink',
    shortName: 'Lavatory',
    width: 0.65,
    depth: 0.54,
    height: 1.70,
    volume: 2.69,
    category: 'hygiene',
    color: '#5FD392',
    allowedAnchors: ['floor', 'wall'],
    zAware: true
  },
  {
    id: 'shower',
    name: 'Shower Stall',
    shortName: 'Shower',
    width: 1.21,
    depth: 1.43,
    height: 2.51,
    volume: 4.34,
    category: 'hygiene',
    color: '#6EE3A5',
    allowedAnchors: ['floor'],
    zAware: true
  },
  {
    id: 'treadmill',
    name: 'Treadmill Device',
    shortName: 'Treadmill',
    width: 0.65,
    depth: 0.69,
    height: 1.91,
    volume: 6.12,
    category: 'exercise',
    color: '#E74C3C',
    allowedAnchors: ['floor'],
    zAware: true
  },
  {
    id: 'cycle',
    name: 'Cycle Ergometer',
    shortName: 'Cycle',
    width: 0.65,
    depth: 0.69,
    height: 1.45,
    volume: 3.38,
    category: 'exercise',
    color: '#EC5E4F',
    allowedAnchors: ['floor'],
    zAware: true
  },
  {
    id: 'ared',
    name: 'Resistive Device (ARED)',
    shortName: 'ARED',
    width: 0.65,
    depth: 0.69,
    height: 1.91,
    volume: 3.92,
    category: 'exercise',
    color: '#F17062',
    allowedAnchors: ['floor'],
    zAware: true
  },
  {
    id: 'medical-bed',
    name: 'Medical Bed / Stretcher',
    shortName: 'Med Bed',
    width: 2.00,
    depth: 1.45,
    height: 2.00,
    volume: 5.80,
    category: 'medical',
    color: '#1ABC9C',
    allowedAnchors: ['floor'],
    zAware: true
  },
  {
    id: 'galley-equipment',
    name: 'Small Galley Equipment',
    shortName: 'Galley Equip',
    width: 1.41,
    depth: 1.41,
    height: 1.91,
    volume: 4.35,
    category: 'dining',
    color: '#F39C12',
    allowedAnchors: ['floor', 'wall'],
    zAware: true
  },
  {
    id: 'dining-table',
    name: 'Dining Table / Small Table',
    shortName: 'Table',
    width: 1.19,
    depth: 1.19,
    height: 1.91,
    volume: 10.09,
    category: 'dining',
    color: '#F5A623',
    allowedAnchors: ['floor'],
    zAware: false
  },
  {
    id: 'workbench',
    name: 'Workbench Tool Station',
    shortName: 'Workbench',
    width: 1.18,
    depth: 2.05,
    height: 2.00,
    volume: 4.82,
    category: 'maintenance',
    color: '#95A5A6',
    allowedAnchors: ['floor', 'wall'],
    zAware: true
  },
  {
    id: 'locker',
    name: 'Storage Locker / Locker Shelf',
    shortName: 'Locker',
    width: 0.60,
    depth: 0.60,
    height: 1.80,
    volume: 0.65,
    category: 'storage',
    color: '#7F8C8D',
    allowedAnchors: ['floor', 'wall'],
    zAware: true
  },
  {
    id: 'logistics-rack',
    name: 'Logistics Rack / Pallet',
    shortName: 'Logistics',
    width: 0.98,
    depth: 2.02,
    height: 2.31,
    volume: 6.00,
    category: 'storage',
    color: '#34495E',
    allowedAnchors: ['floor'],
    zAware: true
  },
  {
    id: 'control-panel',
    name: 'Control Panel / Systems Rack',
    shortName: 'Controls',
    width: 0.80,
    depth: 0.50,
    height: 2.00,
    volume: 0.80,
    category: 'control',
    color: '#2C3E50',
    allowedAnchors: ['wall'],
    zAware: true
  },
  {
    id: 'sensor',
    name: 'Sensor / Environmental Unit',
    shortName: 'Sensor',
    width: 0.40,
    depth: 0.40,
    height: 0.60,
    volume: 0.10,
    category: 'control',
    color: '#16A085',
    allowedAnchors: ['wall', 'ceiling'],
    zAware: false
  }
];
