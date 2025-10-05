import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line, Group, Circle } from 'react-konva';
import Konva from 'konva';
import { toast } from 'sonner';
import { MainModule } from '@/data/mainModules';
import { SubModule } from '@/data/subModules';
import { PlacedMainModule, PlacedSubModule, LayoutState } from '@/types/layout';

const PIXELS_PER_METER = 40;
const GRID_SIZE = 0.5;

interface LayoutCanvas2DProps {
  layoutState: LayoutState;
  onStateChange: (state: LayoutState) => void;
}

export const LayoutCanvas2D = ({ layoutState, onStateChange }: LayoutCanvas2DProps) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const selectedId = layoutState.selectedMainModuleId || layoutState.selectedSubModuleId;
      if (!selectedId) return;
      
      if (e.key === 'r' || e.key === 'R') {
        // Rotate selected main module only
        if (layoutState.selectedMainModuleId) {
          e.preventDefault();
          onStateChange({
            ...layoutState,
            mainModules: layoutState.mainModules.map(m =>
              m.instanceId === layoutState.selectedMainModuleId
                ? { ...m, rotation: (m.rotation + 90) % 360 }
                : m
            )
          });
          toast.success('Main module rotated 90°');
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Delete selected module
        e.preventDefault();
        
        if (layoutState.selectedMainModuleId) {
          const moduleName = layoutState.mainModules.find(
            m => m.instanceId === layoutState.selectedMainModuleId
          )?.shortName;
          
          onStateChange({
            ...layoutState,
            mainModules: layoutState.mainModules.filter(
              m => m.instanceId !== layoutState.selectedMainModuleId
            ),
            subModules: layoutState.subModules.filter(
              s => s.parentInstanceId !== layoutState.selectedMainModuleId
            ),
            connections: layoutState.connections.filter(
              c => c.fromModuleId !== layoutState.selectedMainModuleId && 
                   c.toModuleId !== layoutState.selectedMainModuleId
            ),
            selectedMainModuleId: null
          });
          toast.success(`${moduleName} and its sub-modules deleted`);
        } else if (layoutState.selectedSubModuleId) {
          const subModuleName = layoutState.subModules.find(
            s => s.instanceId === layoutState.selectedSubModuleId
          )?.shortName;
          
          onStateChange({
            ...layoutState,
            subModules: layoutState.subModules.filter(
              s => s.instanceId !== layoutState.selectedSubModuleId
            ),
            selectedSubModuleId: null
          });
          toast.success(`${subModuleName} deleted`);
        }
      } else if (e.key === 'Escape') {
        // Deselect
        e.preventDefault();
        onStateChange({
          ...layoutState,
          selectedMainModuleId: null,
          selectedSubModuleId: null
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [layoutState, onStateChange]);

  const snapToGrid = (value: number) => {
    return Math.round(value / (GRID_SIZE * PIXELS_PER_METER)) * (GRID_SIZE * PIXELS_PER_METER);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const moduleType = e.dataTransfer.getData('moduleType');
    
    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const transform = stage.getAbsoluteTransform().copy().invert();
    const localPos = transform.point(pos);

    if (moduleType === 'main') {
      const moduleData = e.dataTransfer.getData('mainModule');
      if (!moduleData) return;
      
      const module = JSON.parse(moduleData) as MainModule;
      const snappedX = snapToGrid(localPos.x) / PIXELS_PER_METER;
      const snappedY = snapToGrid(localPos.y) / PIXELS_PER_METER;

      const newModule: PlacedMainModule = {
        ...module,
        x: snappedX,
        y: snappedY,
        rotation: 0,
        instanceId: `${module.id}-${Date.now()}`
      };

      onStateChange({
        ...layoutState,
        mainModules: [...layoutState.mainModules, newModule]
      });
      
      toast.success(`Added ${module.shortName} to layout`);
    } else if (moduleType === 'sub') {
      const moduleData = e.dataTransfer.getData('subModule');
      if (!moduleData) return;
      
      const module = JSON.parse(moduleData) as SubModule;
      
      // Find parent main module at drop location
      const dropX = localPos.x / PIXELS_PER_METER;
      const dropY = localPos.y / PIXELS_PER_METER;
      
      const parentModule = layoutState.mainModules.find(m => {
        const dim = m.rotation === 90 || m.rotation === 270 
          ? { w: m.depth, d: m.width } 
          : { w: m.width, d: m.depth };
        return dropX >= m.x && dropX <= m.x + dim.w &&
               dropY >= m.y && dropY <= m.y + dim.d;
      });

      if (!parentModule) {
        toast.error('Sub-modules must be placed inside a main module');
        return;
      }

      if (!parentModule.allowedSubModules.includes(module.id)) {
        toast.error(`${module.shortName} cannot be placed in ${parentModule.shortName}`);
        return;
      }

      const newSubModule: PlacedSubModule = {
        ...module,
        parentInstanceId: parentModule.instanceId,
        x: dropX - parentModule.x,
        y: dropY - parentModule.y,
        z: 0,
        instanceId: `${module.id}-${Date.now()}`
      };

      onStateChange({
        ...layoutState,
        subModules: [...layoutState.subModules, newSubModule]
      });
      
      toast.success(`Added ${module.shortName} to ${parentModule.shortName}`);
    }
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 
      ? Math.min(oldScale * 1.1, 3)
      : Math.max(oldScale / 1.1, 0.3);

    setScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const renderGrid = () => {
    const lines = [];
    const gridSpacing = GRID_SIZE * PIXELS_PER_METER;
    const width = dimensions.width / scale;
    const height = dimensions.height / scale;

    for (let i = 0; i < width / gridSpacing + 20; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridSpacing, 0, i * gridSpacing, height + 1000]}
          stroke="hsl(var(--grid-line))"
          strokeWidth={0.5 / scale}
        />
      );
    }

    for (let i = 0; i < height / gridSpacing + 20; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridSpacing, width + 1000, i * gridSpacing]}
          stroke="hsl(var(--grid-line))"
          strokeWidth={0.5 / scale}
        />
      );
    }

    return lines;
  };

  const handleMainModuleDragEnd = (moduleId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const newX = snapToGrid(e.target.x()) / PIXELS_PER_METER;
    const newY = snapToGrid(e.target.y()) / PIXELS_PER_METER;
    
    onStateChange({
      ...layoutState,
      mainModules: layoutState.mainModules.map((m) =>
        m.instanceId === moduleId
          ? { ...m, x: newX, y: newY }
          : m
      )
    });
    
    e.target.position({ x: newX * PIXELS_PER_METER, y: newY * PIXELS_PER_METER });
  };

  const handleSubModuleDragEnd = (subModuleId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const sub = layoutState.subModules.find(s => s.instanceId === subModuleId);
    if (!sub) return;
    
    const parent = layoutState.mainModules.find(m => m.instanceId === sub.parentInstanceId);
    if (!parent) return;
    
    const newX = e.target.x() / PIXELS_PER_METER;
    const newY = e.target.y() / PIXELS_PER_METER;
    
    onStateChange({
      ...layoutState,
      subModules: layoutState.subModules.map((s) =>
        s.instanceId === subModuleId
          ? { ...s, x: newX, y: newY }
          : s
      )
    });
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-canvas relative"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        draggable
        x={stagePos.x}
        y={stagePos.y}
        scaleX={scale}
        scaleY={scale}
        onDragEnd={(e) => {
          setStagePos({ x: e.target.x(), y: e.target.y() });
        }}
      >
        <Layer>
          {renderGrid()}
        </Layer>
        
        {/* Connections Layer */}
        <Layer>
          {layoutState.connections.map(conn => {
            const fromModule = layoutState.mainModules.find(m => m.instanceId === conn.fromModuleId);
            const toModule = layoutState.mainModules.find(m => m.instanceId === conn.toModuleId);
            
            if (!fromModule || !toModule) return null;
            
            const getDimensions = (m: PlacedMainModule) => {
              if (m.rotation === 90 || m.rotation === 270) {
                return { width: m.depth, depth: m.width };
              }
              return { width: m.width, depth: m.depth };
            };
            
            const dim1 = getDimensions(fromModule);
            const dim2 = getDimensions(toModule);
            
            const fromX = (fromModule.x + dim1.width / 2) * PIXELS_PER_METER;
            const fromY = (fromModule.y + dim1.depth / 2) * PIXELS_PER_METER;
            const toX = (toModule.x + dim2.width / 2) * PIXELS_PER_METER;
            const toY = (toModule.y + dim2.depth / 2) * PIXELS_PER_METER;

            return (
              <Line
                key={conn.id}
                points={[fromX, fromY, toX, toY]}
                stroke="hsl(var(--primary))"
                strokeWidth={3 / scale}
                dash={[10, 5]}
              />
            );
          })}
        </Layer>

        {/* Main Modules Layer */}
        <Layer>
          {layoutState.mainModules.map((module) => {
            const isSelected = layoutState.selectedMainModuleId === module.instanceId;
            
            const displayWidth = (module.rotation === 90 || module.rotation === 270) 
              ? module.depth 
              : module.width;
            const displayDepth = (module.rotation === 90 || module.rotation === 270) 
              ? module.width 
              : module.depth;
            
            return (
              <Group
                key={module.instanceId}
                x={module.x * PIXELS_PER_METER}
                y={module.y * PIXELS_PER_METER}
                draggable
                onClick={() => onStateChange({ 
                  ...layoutState, 
                  selectedMainModuleId: module.instanceId,
                  selectedSubModuleId: null 
                })}
                onTap={() => onStateChange({ 
                  ...layoutState, 
                  selectedMainModuleId: module.instanceId,
                  selectedSubModuleId: null 
                })}
                onDragEnd={(e) => handleMainModuleDragEnd(module.instanceId, e)}
              >
                <Rect
                  width={displayWidth * PIXELS_PER_METER}
                  height={displayDepth * PIXELS_PER_METER}
                  fill={module.color}
                  stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                  strokeWidth={isSelected ? 3 / scale : 1 / scale}
                  opacity={0.7}
                  shadowBlur={isSelected ? 10 : 0}
                  shadowColor="hsl(var(--primary))"
                />
                
                {/* Port indicators */}
                {module.ports.map(port => {
                  let portX = 0, portY = 0;
                  
                  switch(port.position) {
                    case 'north':
                      portX = port.x * PIXELS_PER_METER;
                      portY = -5 / scale;
                      break;
                    case 'south':
                      portX = port.x * PIXELS_PER_METER;
                      portY = displayDepth * PIXELS_PER_METER + 5 / scale;
                      break;
                    case 'east':
                      portX = displayWidth * PIXELS_PER_METER + 5 / scale;
                      portY = port.y * PIXELS_PER_METER;
                      break;
                    case 'west':
                      portX = -5 / scale;
                      portY = port.y * PIXELS_PER_METER;
                      break;
                  }
                  
                  const portColor = port.type === 'hab-port' ? '#4A90E2' :
                                   port.type === 'svc-port' ? '#50C878' :
                                   port.type === 'airlock-port' ? '#E74C3C' : '#F39C12';
                  
                  return (
                    <Circle
                      key={port.id}
                      x={portX}
                      y={portY}
                      radius={4 / scale}
                      fill={portColor}
                      stroke="white"
                      strokeWidth={1 / scale}
                    />
                  );
                })}
                
                {/* Module name */}
                <Text
                  text={module.shortName}
                  width={displayWidth * PIXELS_PER_METER}
                  height={displayDepth * PIXELS_PER_METER}
                  align="center"
                  verticalAlign="middle"
                  fontSize={14 / scale}
                  fill="white"
                  fontStyle="bold"
                />
                
                {/* Dimensions */}
                <Text
                  text={`${displayWidth.toFixed(2)}×${displayDepth.toFixed(2)}m`}
                  y={(displayDepth * PIXELS_PER_METER) - (20 / scale)}
                  width={displayWidth * PIXELS_PER_METER}
                  align="center"
                  fontSize={10 / scale}
                  fill="white"
                />
                
                {/* Rotation indicator */}
                {module.rotation !== 0 && (
                  <Text
                    text={`${module.rotation}°`}
                    x={2 / scale}
                    y={2 / scale}
                    fontSize={9 / scale}
                    fill="white"
                    fontStyle="bold"
                  />
                )}
              </Group>
            );
          })}
        </Layer>
        
        {/* Sub-Modules Layer */}
        <Layer>
          {layoutState.subModules.map((subModule) => {
            const parent = layoutState.mainModules.find(m => m.instanceId === subModule.parentInstanceId);
            if (!parent) return null;
            
            const isSelected = layoutState.selectedSubModuleId === subModule.instanceId;
            
            return (
              <Group
                key={subModule.instanceId}
                x={(parent.x + subModule.x) * PIXELS_PER_METER}
                y={(parent.y + subModule.y) * PIXELS_PER_METER}
                draggable
                onClick={(e) => {
                  e.cancelBubble = true;
                  onStateChange({ 
                    ...layoutState, 
                    selectedSubModuleId: subModule.instanceId,
                    selectedMainModuleId: null
                  });
                }}
                onTap={(e) => {
                  e.cancelBubble = true;
                  onStateChange({ 
                    ...layoutState, 
                    selectedSubModuleId: subModule.instanceId,
                    selectedMainModuleId: null
                  });
                }}
                onDragEnd={(e) => handleSubModuleDragEnd(subModule.instanceId, e)}
              >
                <Rect
                  width={subModule.width * PIXELS_PER_METER}
                  height={subModule.depth * PIXELS_PER_METER}
                  fill={subModule.color}
                  stroke={isSelected ? 'hsl(var(--ring))' : 'rgba(255,255,255,0.5)'}
                  strokeWidth={isSelected ? 2 / scale : 0.5 / scale}
                  opacity={0.9}
                  dash={[5, 3]}
                />
                
                <Text
                  text={subModule.shortName}
                  width={subModule.width * PIXELS_PER_METER}
                  height={subModule.depth * PIXELS_PER_METER}
                  align="center"
                  verticalAlign="middle"
                  fontSize={10 / scale}
                  fill="white"
                />
                
                {subModule.zAware && (
                  <Text
                    text={`z:${subModule.z.toFixed(1)}m`}
                    x={2 / scale}
                    y={2 / scale}
                    fontSize={8 / scale}
                    fill="rgba(255,255,255,0.8)"
                  />
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>

      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm p-3 rounded-lg border border-border shadow-lg">
        <p className="text-xs text-muted-foreground mb-2">Controls</p>
        <ul className="text-xs space-y-1 text-card-foreground">
          <li>• Drag canvas to pan</li>
          <li>• Scroll to zoom</li>
          <li>• Drag components from library</li>
          <li>• Click component to select</li>
          <li>• Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">R</kbd> to rotate</li>
          <li>• Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Del</kbd> to delete</li>
          <li>• Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> to deselect</li>
        </ul>
      </div>

      <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm p-3 rounded-lg border border-border shadow-lg">
        <p className="text-xs text-muted-foreground">Main Modules: {layoutState.mainModules.length}</p>
        <p className="text-xs text-muted-foreground">Sub-Modules: {layoutState.subModules.length}</p>
        <p className="text-xs text-muted-foreground">Connections: {layoutState.connections.length}</p>
        <p className="text-xs text-muted-foreground">Zoom: {Math.round(scale * 100)}%</p>
        {layoutState.selectedMainModuleId && (
          <p className="text-xs text-primary mt-1">Selected: {layoutState.mainModules.find(m => m.instanceId === layoutState.selectedMainModuleId)?.shortName}</p>
        )}
        {layoutState.selectedSubModuleId && (
          <p className="text-xs text-ring mt-1">Selected: {layoutState.subModules.find(s => s.instanceId === layoutState.selectedSubModuleId)?.shortName}</p>
        )}
      </div>
    </div>
  );
};
