import { useState } from 'react';
import { ComponentLibrary } from '@/components/ComponentLibrary';
import { LayoutCanvas } from '@/components/LayoutCanvas';
import { Toolbar } from '@/components/Toolbar';
import { HabitatModule } from '@/data/habitatModules';

const Index = () => {
  const [selectedModule, setSelectedModule] = useState<HabitatModule | null>(null);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 flex-shrink-0">
          <ComponentLibrary onModuleSelect={setSelectedModule} />
        </div>
        <div className="flex-1">
          <LayoutCanvas />
        </div>
      </div>
    </div>
  );
};

export default Index;
