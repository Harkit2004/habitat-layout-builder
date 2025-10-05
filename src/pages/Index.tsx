// Updated Index.tsx - Save this to src/pages/Index.tsx

import { useState } from 'react';
import { ComponentLibrary } from '@/components/ComponentLibrary';
import { LayoutCanvas2D } from '@/components/LayoutCanvas2D';
import { ValidationPanel } from '@/components/ValidationPanel';
import { Toolbar } from '@/components/Toolbar';
import { LayoutState } from '@/types/layout';
import { validateLayout } from '@/utils/validation';

const Index = () => {
  const [layoutState, setLayoutState] = useState<LayoutState>({
    crewSize: 4,
    mainModules: [],
    subModules: [],
    connections: [],
    selectedMainModuleId: null,
    selectedSubModuleId: null
  });

  const validationErrors = validateLayout(layoutState);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toolbar layoutState={layoutState} onStateChange={setLayoutState} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Component Library */}
        <div className="w-80 flex-shrink-0">
          <ComponentLibrary />
        </div>
        
        {/* Center - 2D Canvas */}
        <div className="flex-1">
          <LayoutCanvas2D 
            layoutState={layoutState}
            onStateChange={setLayoutState}
          />
        </div>

        {/* Right sidebar - Validation Panel */}
        <div className="w-80 flex-shrink-0">
          <ValidationPanel errors={validationErrors} />
        </div>
      </div>
    </div>
  );
};

export default Index;
