import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line, Group, Circle } from 'react-konva';
import { MainModule } from '@/data/mainModules';
import { SubModule } from '@/data/subModules';
import { PlacedMainModule, PlacedSubModule, Connection, LayoutState } from '@/types/layout';
import Konva from 'konva';
import { toast } from 'sonner';

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

  const snapToGrid = (value: number) => {
    return Math.round(value / (GRID_SIZE * PIXELS_PER_METER)) * (GRID_SIZE * PIXELS_PER_METER);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const mainModuleData = e.dataTransfer.getData('mainModule');
    const subModuleData = e.dataTransfer.getData('subModule');
    
    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const transform = stage.getAbsoluteTransform().copy().invert();
    const localPos = transform.point(pos);

    if (mainModuleData) {
      const module = JSON.parse(mainModuleData) as MainModule;
      const snappedX = snapToGrid(localPos.x);
      const snappedY = snapToGrid(localPos.y);

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
    } else if (subModuleData) {
      toast.info('Select a main module first, then place sub-modules inside it');
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
    const newX = snapToGrid(e.target.x());
    const newY = snapToGrid(e.target.y());
    
    onStateChange({
      ...layoutState,
      mainModules: layoutState.mainModules.map((m) =>
        m.instanceId === moduleId
          ? { ...m, x: newX, y: newY }
          : m
      )
    });
    
    e.target.position({ x: newX, y: newY });
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
            
            const fromPort = fromModule.ports.find(p => p.id === conn.fromPortId);
            const toPort = toModule.ports.find(p => p.id === conn.toPortId);
            
            if (!fromPort || !toPort) return null;

            const fromX = (fromModule.x + fromPort.x) * PIXELS_PER_METER;
            const fromY = (fromModule.y + fromPort.y) * PIXELS_PER_METER;
            const toX = (toModule.x + toPort.x) * PIXELS_PER_METER;
            const toY = (toModule.y + toPort.y) * PIXELS_PER_METER;

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
            return (
              <Group
                key={module.instanceId}
                x={module.x * PIXELS_PER_METER}
                y={module.y * PIXELS_PER_METER}
                draggable
                onClick={() => onStateChange({ ...layoutState, selectedMainModuleId: module.instanceId })}
                onTap={() => onStateChange({ ...layoutState, selectedMainModuleId: module.instanceId })}
                onDragEnd={(e) => handleMainModuleDragEnd(module.instanceId, e)}
              >
                <Rect
                  width={module.width * PIXELS_PER_METER}
                  height={module.depth * PIXELS_PER_METER}
                  fill={module.color}
                  stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                  strokeWidth={isSelected ? 3 / scale : 1 / scale}
                  opacity={0.8}
                  shadowBlur={isSelected ? 10 : 0}
                  shadowColor="hsl(var(--primary))"
                />
                
                {/* Ports */}
                {module.ports.map(port => (
                  <Circle
                    key={port.id}
                    x={port.x * PIXELS_PER_METER}
                    y={port.y * PIXELS_PER_METER}
                    radius={4 / scale}
                    fill="hsl(var(--primary))"
                    stroke="white"
                    strokeWidth={1 / scale}
                  />
                ))}
                
                <Text
                  text={module.shortName}
                  width={module.width * PIXELS_PER_METER}
                  height={module.depth * PIXELS_PER_METER}
                  align="center"
                  verticalAlign="middle"
                  fontSize={14 / scale}
                  fill="white"
                  fontStyle="bold"
                />
                <Text
                  text={`${module.width}×${module.depth}m`}
                  y={(module.depth * PIXELS_PER_METER) - (20 / scale)}
                  width={module.width * PIXELS_PER_METER}
                  align="center"
                  fontSize={10 / scale}
                  fill="white"
                />
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
          <li>• Drag main modules from library</li>
          <li>• Click module to select</li>
        </ul>
      </div>

      <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm p-3 rounded-lg border border-border shadow-lg">
        <p className="text-xs text-muted-foreground">Main Modules: {layoutState.mainModules.length}</p>
        <p className="text-xs text-muted-foreground">Sub-Modules: {layoutState.subModules.length}</p>
        <p className="text-xs text-muted-foreground">Zoom: {Math.round(scale * 100)}%</p>
      </div>
    </div>
  );
};
