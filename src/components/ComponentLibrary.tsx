import { mainModules, MainModule } from '@/data/mainModules';
import { subModules, SubModule } from '@/data/subModules';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Maximize2, Box, Link2 } from 'lucide-react';
import { useState } from 'react';

export const ComponentLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMainModules = mainModules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubModules = subModules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-semibold text-sidebar-foreground flex items-center gap-2">
          <Box className="w-4 h-4" />
          Component Library
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Drag components to canvas
        </p>
        
        <Input
          placeholder="Search modules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-3 h-8 text-sm"
        />
      </div>

      <Tabs defaultValue="main" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="main" className="flex-1">
            Main Modules ({filteredMainModules.length})
          </TabsTrigger>
          <TabsTrigger value="sub" className="flex-1">
            Sub-Modules ({filteredSubModules.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {filteredMainModules.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No main modules found
                </p>
              ) : (
                filteredMainModules.map(module => (
                  <Card
                    key={module.id}
                    className="p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all hover:border-primary"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('moduleType', 'main');
                      e.dataTransfer.setData('mainModule', JSON.stringify(module));
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div 
                        className="w-3 h-3 rounded mt-1 flex-shrink-0"
                        style={{ backgroundColor: module.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-card-foreground">
                          {module.shortName}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize mb-1">
                          {module.category}
                        </p>
                        <div className="flex gap-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {module.width.toFixed(2)}×{module.depth.toFixed(2)}m
                          </Badge>
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Maximize2 className="w-2 h-2" />
                            {module.height.toFixed(2)}m
                          </Badge>
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Link2 className="w-2 h-2" />
                            {module.ports.length} ports
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Vol: {module.volume.toFixed(1)} m³
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sub" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {filteredSubModules.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No sub-modules found
                </p>
              ) : (
                filteredSubModules.map(module => (
                  <Card
                    key={module.id}
                    className="p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all hover:border-primary"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('moduleType', 'sub');
                      e.dataTransfer.setData('subModule', JSON.stringify(module));
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div 
                        className="w-3 h-3 rounded mt-1 flex-shrink-0"
                        style={{ backgroundColor: module.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-card-foreground">
                          {module.shortName}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize mb-1">
                          {module.category}
                        </p>
                        <div className="flex gap-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {module.width.toFixed(2)}×{module.depth.toFixed(2)}m
                          </Badge>
                          {module.zAware && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Maximize2 className="w-2 h-2" />
                              {module.height.toFixed(2)}m
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {module.allowedAnchors.map(anchor => (
                            <Badge key={anchor} variant="secondary" className="text-xs">
                              {anchor}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Vol: {module.volume.toFixed(2)} m³
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t border-sidebar-border bg-sidebar/50">
        <p className="text-xs text-muted-foreground">
          💡 Main modules connect via ports • Sub-modules go inside main modules
        </p>
      </div>
    </div>
  );
};
