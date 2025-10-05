import { useState } from 'react';
import { MainModuleLibrary } from '@/components/MainModuleLibrary';
import { SubModuleLibrary } from '@/components/SubModuleLibrary';
import { LayoutCanvas2D } from '@/components/LayoutCanvas2D';
import { ValidationPanel } from '@/components/ValidationPanel';
import { Toolbar } from '@/components/Toolbar';
import { MainModule } from '@/data/mainModules';
import { SubModule } from '@/data/subModules';
import { LayoutState } from '@/types/layout';
import { validateLayout } from '@/utils/validation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
        <div className="w-80 flex-shrink-0">
          <Tabs defaultValue="main" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-2">
              <TabsTrigger value="main">Main Modules</TabsTrigger>
              <TabsTrigger value="sub">Sub-Modules</TabsTrigger>
            </TabsList>
            <TabsContent value="main" className="flex-1 m-0">
              <MainModuleLibrary onModuleSelect={() => {}} />
            </TabsContent>
            <TabsContent value="sub" className="flex-1 m-0">
              <SubModuleLibrary onModuleSelect={() => {}} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex-1">
          <LayoutCanvas2D 
            layoutState={layoutState}
            onStateChange={setLayoutState}
          />
        </div>

        <div className="w-80 flex-shrink-0">
          <ValidationPanel errors={validationErrors} />
        </div>
      </div>
    </div>
  );
};

export default Index;
