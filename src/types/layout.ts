import { MainModule, Port } from '@/data/mainModules';
import { SubModule } from '@/data/subModules';

export interface PlacedMainModule extends MainModule {
  instanceId: string;
  x: number;
  y: number;
  rotation: number; // degrees: 0, 90, 180, 270
}

export interface PlacedSubModule extends SubModule {
  instanceId: string;
  parentInstanceId: string; // instanceId of the parent main module
  x: number; // relative to parent
  y: number; // relative to parent
  z: number; // z-layer/height within parent
}

export interface Connection {
  id: string;
  fromModuleId: string;
  fromPortId: string;
  toModuleId: string;
  toPortId: string;
}

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  moduleId?: string;
}

export interface LayoutState {
  crewSize: number;
  mainModules: PlacedMainModule[];
  subModules: PlacedSubModule[];
  connections: Connection[];
  selectedMainModuleId: string | null;
  selectedSubModuleId: string | null;
}
