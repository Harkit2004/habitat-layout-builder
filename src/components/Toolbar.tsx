import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Trash2,
  Save,
  FolderOpen,
  Download,
  Box,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Toolbar = () => {
  return (
    <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="font-semibold text-lg text-card-foreground flex items-center gap-2">
          <Box className="w-5 h-5 text-primary" />
          Habitat Layout Builder
        </h1>
        <Badge variant="outline" className="text-xs">2D View</Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <FolderOpen className="w-4 h-4 mr-2" />
          Open
        </Button>
        <Button variant="ghost" size="sm">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button variant="ghost" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        <Button variant="ghost" size="sm">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Move className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Trash2 className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2" />

        <Button variant="default" size="sm" disabled>
          <Box className="w-4 h-4 mr-2" />
          Switch to 3D
        </Button>
      </div>
    </div>
  );
};
