export type AnchorType = 'floor' | 'wall' | 'ceiling';

export interface SubModule {
  id: string;
  name: string;
  shortName: string;
  width: number; // meters
  depth: number; // meters (length in specs)
  height: number; // meters
  volume: number; // m³
  category: 'hygiene' | 'dining' | 'storage' | 'maintenance' | 'habitat' | 'medical' | 'galley';
  color: string;
  allowedAnchors: AnchorType[];
  zAware: boolean; // whether height matters for placement
}

export const subModules: SubModule[] = [
  // J. Shower stall
  {
    id: 'shower-stall',
    name: 'Shower Stall',
    shortName: 'Shower',
    width: 1.21,
    depth: 1.43,
    height: 2.51,
    volume: 4.34,
    category: 'hygiene',
    color: '#50C878',
    allowedAnchors: ['floor'],
    zAware: true
  },

  // K. Dining table zone (tabletop / creative)
  {
    id: 'dining-table',
    name: 'Dining Table Zone',
    shortName: 'Table',
    width: 1.91,
    depth: 1.91,
    height: 1.49,
    volume: 10.09,
    category: 'dining',
    color: '#F39C12',
    allowedAnchors: ['floor'],
    zAware: false
  },

  // L. Storage locker (small-item containment)
  {
    id: 'locker',
    name: 'Storage Locker',
    shortName: 'Locker',
    width: 0.65,
    depth: 0.54,
    height: 1.91,
    volume: 1.20,
    category: 'storage',
    color: '#7F8C8D',
    allowedAnchors: ['floor', 'wall'],
    zAware: true
  },

  // M. Logistics rack
  {
    id: 'logistics-rack',
    name: 'Logistics Rack',
    shortName: 'Log Rack',
    width: 0.98,
    depth: 2.02,
    height: 2.31,
    volume: 6.00,
    category: 'storage',
    color: '#34495E',
    allowedAnchors: ['floor'],
    zAware: true
  },

  // N. Workbench surface
  {
    id: 'workbench-surface',
    name: 'Workbench Surface',
    shortName: 'Workbench',
    width: 2.02,
    depth: 0.98,
    height: 1.91,
    volume: 4.35,
    category: 'maintenance',
    color: '#95A5A6',
    allowedAnchors: ['floor', 'wall'],
    zAware: true
  },

  // O. Private mirror station
  {
    id: 'mirror-station',
    name: 'Private Mirror Station',
    shortName: 'Mirror',
    width: 0.91,
    depth: 0.99,
    height: 2.00,
    volume: 1.80,
    category: 'habitat',
    color: '#4A90E2',
    allowedAnchors: ['wall'],
    zAware: true
  },

  // P. Personal leisure seat
  {
    id: 'leisure-seat',
    name: 'Personal Leisure Seat',
    shortName: 'Seat',
    width: 0.91,
    depth: 0.66,
    height: 2.00,
    volume: 1.20,
    category: 'habitat',
    color: '#5C9FE8',
    allowedAnchors: ['floor'],
    zAware: true
  },

  // Q. Food-prep console
  {
    id: 'food-prep-console',
    name: 'Food-Prep Console',
    shortName: 'Food Prep',
    width: 1.41,
    depth: 1.41,
    height: 1.91,
    volume: 4.35,
    category: 'galley',
    color: '#F5A623',
    allowedAnchors: ['floor', 'wall'],
    zAware: true
  },

  // R. Medical treatment bay
  {
    id: 'treatment-bay',
    name: 'Medical Treatment Bay',
    shortName: 'Med Bay',
    width: 2.00,
    depth: 1.45,
    height: 2.00,
    volume: 5.80,
    category: 'medical',
    color: '#1ABC9C',
    allowedAnchors: ['floor'],
    zAware: true
  }
];
