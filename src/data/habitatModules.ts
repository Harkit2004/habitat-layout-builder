export interface HabitatModule {
  id: string;
  name: string;
  shortName: string;
  volume: number;
  width: number;
  depth: number;
  height: number;
  category: 'living' | 'hygiene' | 'dining' | 'social' | 'exercise' | 'medical' | 'maintenance' | 'storage';
  color: string;
}

export const habitatModules: HabitatModule[] = [
  {
    id: 'sleep',
    name: 'Sleep Module',
    shortName: 'Sleep',
    volume: 10.76,
    width: 2.00,
    depth: 1.45,
    height: 2.00,
    category: 'living',
    color: '#4A90E2'
  },
  {
    id: 'desk',
    name: 'Private-Work / Desk Module',
    shortName: 'Desk',
    volume: 4.35,
    width: 2.02,
    depth: 0.98,
    height: 1.91,
    category: 'living',
    color: '#5C9FE8'
  },
  {
    id: 'shower',
    name: 'Full-Body Hygiene Module',
    shortName: 'Shower',
    volume: 4.34,
    width: 1.21,
    depth: 1.43,
    height: 2.51,
    category: 'hygiene',
    color: '#50C878'
  },
  {
    id: 'toilet',
    name: 'Toilet / Waste Collection Module',
    shortName: 'Toilet',
    volume: 2.36,
    width: 0.65,
    depth: 0.67,
    height: 1.49,
    category: 'hygiene',
    color: '#5FD392'
  },
  {
    id: 'lavatory',
    name: 'Hand-Cleaning / Lavatory Station',
    shortName: 'Lavatory',
    volume: 2.69,
    width: 0.65,
    depth: 0.54,
    height: 1.70,
    category: 'hygiene',
    color: '#6EE3A5'
  },
  {
    id: 'dining-table',
    name: 'Dining / Wardroom Table Module',
    shortName: 'Dining',
    volume: 10.09,
    width: 1.19,
    depth: 1.19,
    height: 1.91,
    category: 'dining',
    color: '#F39C12'
  },
  {
    id: 'food-prep',
    name: 'Food-Prep Module',
    shortName: 'Galley',
    volume: 4.35,
    width: 1.41,
    depth: 1.41,
    height: 1.91,
    category: 'dining',
    color: '#F5A623'
  },
  {
    id: 'utensil-hygiene',
    name: 'Utensil / Food-Equipment Hygiene Module',
    shortName: 'Utensil Clean',
    volume: 3.30,
    width: 1.41,
    depth: 1.41,
    height: 1.70,
    category: 'dining',
    color: '#F7B733'
  },
  {
    id: 'social-open',
    name: 'Open Social / Recreation Module',
    shortName: 'Social Area',
    volume: 18.20,
    width: 3.00,
    depth: 1.95,
    height: 1.70,
    category: 'social',
    color: '#9B59B6'
  },
  {
    id: 'social-tabletop',
    name: 'Tabletop / Small-Group Module',
    shortName: 'Group Table',
    volume: 10.09,
    width: 1.91,
    depth: 1.91,
    height: 1.49,
    category: 'social',
    color: '#A569BD'
  },
  {
    id: 'treadmill',
    name: 'Treadmill Exercise Module',
    shortName: 'Treadmill',
    volume: 6.12,
    width: 0.65,
    depth: 0.69,
    height: 1.91,
    category: 'exercise',
    color: '#E74C3C'
  },
  {
    id: 'cycle',
    name: 'Cycle Ergometer Module',
    shortName: 'Cycle',
    volume: 3.38,
    width: 0.65,
    depth: 0.69,
    height: 1.45,
    category: 'exercise',
    color: '#EC5E4F'
  },
  {
    id: 'ared',
    name: 'Resistive-Exercise / ARED Module',
    shortName: 'ARED',
    volume: 3.92,
    width: 0.65,
    depth: 0.69,
    height: 1.91,
    category: 'exercise',
    color: '#F17062'
  },
  {
    id: 'medical',
    name: 'Medical Care / Treatment Module',
    shortName: 'Medical',
    volume: 5.80,
    width: 2.00,
    depth: 1.45,
    height: 2.00,
    category: 'medical',
    color: '#1ABC9C'
  },
  {
    id: 'maintenance',
    name: 'Maintenance / Workbench Module',
    shortName: 'Workbench',
    volume: 4.82,
    width: 1.18,
    depth: 2.05,
    height: 2.00,
    category: 'maintenance',
    color: '#95A5A6'
  },
  {
    id: 'logistics',
    name: 'Logistics / Temporary Stowage Module',
    shortName: 'Storage',
    volume: 6.00,
    width: 0.98,
    depth: 2.02,
    height: 2.31,
    category: 'storage',
    color: '#7F8C8D'
  }
];

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    living: '#4A90E2',
    hygiene: '#50C878',
    dining: '#F39C12',
    social: '#9B59B6',
    exercise: '#E74C3C',
    medical: '#1ABC9C',
    maintenance: '#95A5A6',
    storage: '#7F8C8D'
  };
  return colors[category] || '#95A5A6';
};
