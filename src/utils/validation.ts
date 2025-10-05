import { LayoutState, PlacedMainModule, PlacedSubModule, ValidationError } from '@/types/layout';
import { mainModules, canPortsConnect } from '@/data/mainModules';
import { subModules } from '@/data/subModules';

// Minimum required volumes per crew member (from NASA guidelines)
const MIN_HABITABLE_VOLUME_PER_CREW_4 = 10.0; // m³ per crew for 4 crew
const MIN_HABITABLE_VOLUME_PER_CREW_6 = 8.5; // m³ per crew for 6 crew

export const validateLayout = (state: LayoutState): ValidationError[] => {
  const errors: ValidationError[] = [];

  // 1. Check for floating main modules
  const floatingModules = findFloatingModules(state);
  if (floatingModules.length > 0) {
    errors.push({
      type: 'error',
      message: `${floatingModules.length} module(s) are not connected to the station`,
      moduleId: floatingModules[0]
    });
  }

  // 2. Check for overlapping main modules
  const overlaps = checkMainModuleOverlaps(state.mainModules);
  if (overlaps.length > 0) {
    errors.push({
      type: 'error',
      message: `${overlaps.length} overlapping module(s) detected`
    });
  }

  // 3. Validate parent capacity
  const capacityErrors = validateParentCapacity(state);
  errors.push(...capacityErrors);

  // 4. Check crew space requirements
  const volumeError = validateCrewVolume(state);
  if (volumeError) errors.push(volumeError);

  // 5. Check essential presence
  const essentialErrors = validateEssentials(state);
  errors.push(...essentialErrors);

  // 6. Validate z-clearance
  const zErrors = validateZClearance(state);
  errors.push(...zErrors);

  // 7. Validate port compatibility
  const portErrors = validatePortConnections(state);
  errors.push(...portErrors);

  // 8. Validate sub-module placement rules
  const placementErrors = validateSubModulePlacement(state);
  errors.push(...placementErrors);

  return errors;
};

const findFloatingModules = (state: LayoutState): string[] => {
  if (state.mainModules.length === 0) return [];
  if (state.mainModules.length === 1) return []; // Single module is OK

  const connected = new Set<string>();
  const toVisit = [state.mainModules[0].instanceId];
  connected.add(toVisit[0]);

  while (toVisit.length > 0) {
    const current = toVisit.pop()!;
    const connectionsFromCurrent = state.connections.filter(
      c => c.fromModuleId === current || c.toModuleId === current
    );

    for (const conn of connectionsFromCurrent) {
      const otherId = conn.fromModuleId === current ? conn.toModuleId : conn.fromModuleId;
      if (!connected.has(otherId)) {
        connected.add(otherId);
        toVisit.push(otherId);
      }
    }
  }

  return state.mainModules
    .filter(m => !connected.has(m.instanceId))
    .map(m => m.instanceId);
};

const checkMainModuleOverlaps = (modules: PlacedMainModule[]): string[] => {
  const overlapping: string[] = [];

  for (let i = 0; i < modules.length; i++) {
    for (let j = i + 1; j < modules.length; j++) {
      if (doModulesOverlap(modules[i], modules[j])) {
        overlapping.push(modules[i].instanceId);
        overlapping.push(modules[j].instanceId);
      }
    }
  }

  return [...new Set(overlapping)];
};

const doModulesOverlap = (m1: PlacedMainModule, m2: PlacedMainModule): boolean => {
  const rect1 = {
    x: m1.x,
    y: m1.y,
    width: m1.width,
    height: m1.depth
  };

  const rect2 = {
    x: m2.x,
    y: m2.y,
    width: m2.width,
    height: m2.depth
  };

  return !(
    rect1.x + rect1.width <= rect2.x ||
    rect2.x + rect2.width <= rect1.x ||
    rect1.y + rect1.height <= rect2.y ||
    rect2.y + rect2.height <= rect1.y
  );
};

const validateParentCapacity = (state: LayoutState): ValidationError[] => {
  const errors: ValidationError[] = [];

  state.mainModules.forEach(mainModule => {
    const children = state.subModules.filter(
      sub => sub.parentInstanceId === mainModule.instanceId
    );

    const totalSubVolume = children.reduce((sum, sub) => sum + sub.volume, 0);
    const availableVolume = mainModule.volume;

    if (totalSubVolume > availableVolume * 0.9) { // 90% threshold
      errors.push({
        type: 'warning',
        message: `${mainModule.shortName} is at ${Math.round((totalSubVolume / availableVolume) * 100)}% capacity`,
        moduleId: mainModule.instanceId
      });
    }

    if (totalSubVolume > availableVolume) {
      errors.push({
        type: 'error',
        message: `${mainModule.shortName} exceeds volume capacity`,
        moduleId: mainModule.instanceId
      });
    }
  });

  return errors;
};

const validateCrewVolume = (state: LayoutState): ValidationError | null => {
  const totalHabitableVolume = state.mainModules.reduce(
    (sum, m) => sum + m.volume,
    0
  );

  const minRequired =
    state.crewSize <= 4
      ? state.crewSize * MIN_HABITABLE_VOLUME_PER_CREW_4
      : state.crewSize * MIN_HABITABLE_VOLUME_PER_CREW_6;

  if (totalHabitableVolume < minRequired) {
    return {
      type: 'error',
      message: `Insufficient volume: ${totalHabitableVolume.toFixed(1)}m³ / ${minRequired.toFixed(1)}m³ required for ${state.crewSize} crew`
    };
  }

  return null;
};

const validateEssentials = (state: LayoutState): ValidationError[] => {
  const errors: ValidationError[] = [];
  const subModuleIds = state.subModules.map(s => s.id);

  // Calculate minimum required based on crew size
  const minBeds = state.crewSize;
  const minToilets = Math.ceil(state.crewSize / 3);
  const minShowers = Math.max(1, Math.ceil(state.crewSize / 4));
  const minExercise = Math.max(1, Math.ceil(state.crewSize / 3));

  const bedCount = subModuleIds.filter(id => id === 'bed').length;
  const toiletCount = subModuleIds.filter(id => id === 'toilet').length;
  const showerCount = subModuleIds.filter(id => id === 'shower').length;
  const exerciseCount = subModuleIds.filter(
    id => id === 'treadmill' || id === 'cycle' || id === 'ared'
  ).length;

  if (bedCount < minBeds) {
    errors.push({
      type: 'error',
      message: `Need ${minBeds} beds for ${state.crewSize} crew (have ${bedCount})`
    });
  }

  if (toiletCount < minToilets) {
    errors.push({
      type: 'error',
      message: `Need at least ${minToilets} toilet(s) for ${state.crewSize} crew (have ${toiletCount})`
    });
  }

  if (showerCount < minShowers) {
    errors.push({
      type: 'warning',
      message: `Recommend ${minShowers} shower(s) for ${state.crewSize} crew (have ${showerCount})`
    });
  }

  if (exerciseCount < minExercise) {
    errors.push({
      type: 'warning',
      message: `Recommend ${minExercise} exercise device(s) for ${state.crewSize} crew (have ${exerciseCount})`
    });
  }

  return errors;
};

const validateZClearance = (state: LayoutState): ValidationError[] => {
  const errors: ValidationError[] = [];

  state.mainModules.forEach(mainModule => {
    const children = state.subModules.filter(
      sub => sub.parentInstanceId === mainModule.instanceId && sub.zAware
    );

    children.forEach(sub => {
      if (sub.height > mainModule.height) {
        errors.push({
          type: 'error',
          message: `${sub.shortName} height (${sub.height}m) exceeds ${mainModule.shortName} height (${mainModule.height}m)`,
          moduleId: mainModule.instanceId
        });
      }
    });

    // Check for vertical collisions
    for (let i = 0; i < children.length; i++) {
      for (let j = i + 1; j < children.length; j++) {
        if (doSubModulesOverlap(children[i], children[j])) {
          errors.push({
            type: 'error',
            message: `Sub-modules overlap in ${mainModule.shortName}`,
            moduleId: mainModule.instanceId
          });
        }
      }
    }
  });

  return errors;
};

const doSubModulesOverlap = (s1: PlacedSubModule, s2: PlacedSubModule): boolean => {
  // 2D footprint check
  const overlap2D = !(
    s1.x + s1.width <= s2.x ||
    s2.x + s2.width <= s1.x ||
    s1.y + s1.depth <= s2.y ||
    s2.y + s2.depth <= s1.y
  );

  if (!overlap2D) return false;

  // Z-axis check for z-aware modules
  if (s1.zAware && s2.zAware) {
    return !(s1.z + s1.height <= s2.z || s2.z + s2.height <= s1.z);
  }

  return true;
};

const validatePortConnections = (state: LayoutState): ValidationError[] => {
  const errors: ValidationError[] = [];

  state.connections.forEach(conn => {
    const fromModule = state.mainModules.find(m => m.instanceId === conn.fromModuleId);
    const toModule = state.mainModules.find(m => m.instanceId === conn.toModuleId);

    if (!fromModule || !toModule) {
      errors.push({
        type: 'error',
        message: 'Connection references non-existent module'
      });
      return;
    }

    const fromPort = fromModule.ports.find(p => p.id === conn.fromPortId);
    const toPort = toModule.ports.find(p => p.id === conn.toPortId);

    if (!fromPort || !toPort) {
      errors.push({
        type: 'error',
        message: 'Connection references non-existent port'
      });
      return;
    }

    if (!canPortsConnect(fromPort.type, toPort.type)) {
      errors.push({
        type: 'error',
        message: `Incompatible port types: ${fromPort.type} and ${toPort.type}`,
        moduleId: fromModule.instanceId
      });
    }
  });

  return errors;
};

const validateSubModulePlacement = (state: LayoutState): ValidationError[] => {
  const errors: ValidationError[] = [];

  state.subModules.forEach(subModule => {
    const parent = state.mainModules.find(
      m => m.instanceId === subModule.parentInstanceId
    );

    if (!parent) {
      errors.push({
        type: 'error',
        message: `${subModule.shortName} has no parent module`
      });
      return;
    }

    if (!parent.allowedSubModules.includes(subModule.id)) {
      errors.push({
        type: 'error',
        message: `${subModule.shortName} cannot be placed in ${parent.shortName}`,
        moduleId: parent.instanceId
      });
    }
  });

  return errors;
};

export const canSwitchTo3D = (state: LayoutState): { canSwitch: boolean; errors: ValidationError[] } => {
  const errors = validateLayout(state).filter(e => e.type === 'error');
  return {
    canSwitch: errors.length === 0 && state.mainModules.length > 0,
    errors
  };
};
