import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Central Star component
function CentralStar() {
  const starRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (starRef.current) {
      starRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });
  
  return (
    <mesh ref={starRef} position={[-5, 0, 0]}>
      <sphereGeometry args={[12, 32, 32]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
    </mesh>
  );
}

// Elliptical orbit ring component with precise path
function EllipticalOrbitRing() {
  // Create elliptical path geometry
  const createEllipticalPath = () => {
    const points = [];
    const semiMajorAxis = 60;
    const semiMinorAxis = 56;
    const focalDistance = Math.sqrt(semiMajorAxis * semiMajorAxis - semiMinorAxis * semiMinorAxis);
    
    // Generate points along the ellipse
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      const x = focalDistance + semiMajorAxis * Math.cos(angle);
      const z = semiMinorAxis * Math.sin(angle);
      points.push(new THREE.Vector3(x, 0, z));
    }
    
    return new THREE.BufferGeometry().setFromPoints(points);
  };
  
  const geometry = createEllipticalPath();
  
  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ 
      color: 'cyan', 
      transparent: true, 
      opacity: 0.4 
    }))} />
  );
}

// Space Station orbit ring component
function SpaceStationOrbitRing({ isSimulating }: { isSimulating: boolean }) {
  const ringGroupRef = useRef<THREE.Group>(null);
  
  // Create circular orbit path for space station
  const createCircularPath = () => {
    const points = [];
    const radius = 8; // Same as space station orbit radius
    
    // Generate points along the circle
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      points.push(new THREE.Vector3(x, 0, z));
    }
    
    return new THREE.BufferGeometry().setFromPoints(points);
  };
  
  const geometry = createCircularPath();
  
  useFrame(({ clock }) => {
    if (ringGroupRef.current && isSimulating) {
      // Track planet position using same calculations as planet
      const planetTime = clock.getElapsedTime() * 0.1;
      const semiMajorAxis = 60;
      const semiMinorAxis = 56;
      const focalDistance = Math.sqrt(semiMajorAxis * semiMajorAxis - semiMinorAxis * semiMinorAxis);
      
      const ellipseX = semiMajorAxis * Math.cos(planetTime);
      const ellipseZ = semiMinorAxis * Math.sin(planetTime);
      
      // Position ring at planet location
      ringGroupRef.current.position.x = focalDistance + ellipseX;
      ringGroupRef.current.position.z = ellipseZ;
      ringGroupRef.current.position.y = 0;
    }
  });
  
  return (
    <group ref={ringGroupRef} position={[77.888, 0, 0]}>
      <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ 
        color: 'white', 
        transparent: true, 
        opacity: 0.4 
      }))} />
    </group>
  );
}

// Camera controller that follows the planet
function CameraController({ planetPosition, isSimulating }: { planetPosition: THREE.Vector3, isSimulating: boolean }) {
  const { camera } = useThree();
  const cameraOffset = useRef(new THREE.Vector3(0, 20, 30)); // Offset from planet

  useFrame(() => {
    if (isSimulating && planetPosition) {
      // Position camera relative to planet with offset
      const targetPosition = new THREE.Vector3(
        planetPosition.x + cameraOffset.current.x,
        planetPosition.y + cameraOffset.current.y,
        planetPosition.z + cameraOffset.current.z
      );
      
      // Smoothly move camera to follow planet
      camera.position.lerp(targetPosition, 0.05);
      
      // Make camera look at the planet
      camera.lookAt(planetPosition);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

// Planet component that orbits the central star in elliptical orbit
function Planet({ isSimulating, onPositionUpdate }: { isSimulating: boolean, onPositionUpdate: (pos: THREE.Vector3) => void }) {
  const planetRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (planetRef.current && isSimulating) {
      // Elliptical orbit parameters with star at focus (2x larger orbit)
      const planetTime = clock.getElapsedTime() * 0.1; // Slower orbit
      const semiMajorAxis = 60; // Semi-major axis (a) - doubled
      const semiMinorAxis = 56; // Semi-minor axis (b) - doubled
      const focalDistance = Math.sqrt(semiMajorAxis * semiMajorAxis - semiMinorAxis * semiMinorAxis);
      
      // Elliptical orbit calculation - ellipse center offset so star at (-5,0,0) is at focus
      const ellipseX = semiMajorAxis * Math.cos(planetTime);
      const ellipseZ = semiMinorAxis * Math.sin(planetTime);
      
      // Position relative to ellipse center (focalDistance, 0, 0)
      planetRef.current.position.x = focalDistance + ellipseX;
      planetRef.current.position.z = ellipseZ;
      planetRef.current.position.y = 0;
      
      // Report position to parent for camera tracking and space station ring positioning
      onPositionUpdate(new THREE.Vector3(planetRef.current.position.x, planetRef.current.position.y, planetRef.current.position.z));
    }
    
    // Planet rotates on its own axis
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });
  
  return (
    <group ref={planetRef} position={[77.888, 0, 0]}>
      {/* Planet mesh */}
      <mesh ref={planetMeshRef}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
    </group>
  );
}

// Space Station component that orbits the planet
function SpaceStation({ isSimulating, planetPosition }: { isSimulating: boolean, planetPosition: THREE.Vector3 }) {
  const stationRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (stationRef.current && isSimulating) {
      // Get current planet position (elliptical with star at focus)
      const planetTime = clock.getElapsedTime() * 0.1;
      const semiMajorAxis = 60; // Doubled
      const semiMinorAxis = 56; // Doubled
      const focalDistance = Math.sqrt(semiMajorAxis * semiMajorAxis - semiMinorAxis * semiMinorAxis);
      
      const ellipseX = semiMajorAxis * Math.cos(planetTime);
      const ellipseZ = semiMinorAxis * Math.sin(planetTime);
      
      // Match planet position calculation
      const planetX = focalDistance + ellipseX;
      const planetZ = ellipseZ;
      
      // Station orbits around the planet (faster orbit)
      const stationTime = clock.getElapsedTime() * 0.5;
      const stationOrbitRadius = 8;
      
      const stationLocalX = Math.cos(stationTime) * stationOrbitRadius;
      const stationLocalZ = Math.sin(stationTime) * stationOrbitRadius;
      
      // Position station relative to planet
      stationRef.current.position.x = planetX + stationLocalX;
      stationRef.current.position.z = planetZ + stationLocalZ;
      stationRef.current.position.y = 0;
    }
  });
  
  return (
    <group ref={stationRef} position={[85.888, 0, 0]}>
      {/* Yellow marker for space station */}
      <mesh>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial color="yellow" />
      </mesh>
    </group>
  );
}

export function OrbitalSimulator() {
  const navigate = useNavigate();
  const [isSimulating, setIsSimulating] = useState(false);
  const [planetPosition, setPlanetPosition] = useState(new THREE.Vector3(77.888, 0, 0));
  
  return (
    <div className="h-screen bg-black relative">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/')}
          className="bg-gray-900/90 text-white border-gray-600"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Habitat Builder
        </Button>
      </div>

      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-20">
        <Card className="bg-gray-900/90 text-white border-gray-600 w-64">
          <CardHeader>
            <CardTitle className="text-lg">Orbital Simulator</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setIsSimulating(!isSimulating)}
              className="w-full"
              variant={isSimulating ? "destructive" : "default"}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Simulation
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Simulation
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 3D Scene */}
      <Canvas camera={{ position: [40, 30, 40], fov: 60 }}>
        {/* Basic lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        {/* Background stars */}
        <Stars radius={100} depth={50} count={5000} factor={4} />
        
        {/* Orbital Rings */}
        <EllipticalOrbitRing />
        <SpaceStationOrbitRing isSimulating={isSimulating} />
        
        {/* Central Star */}
        <CentralStar />
        
        {/* Planet */}
        <Planet isSimulating={isSimulating} onPositionUpdate={setPlanetPosition} />
        
        {/* Space Station */}
        <SpaceStation isSimulating={isSimulating} planetPosition={planetPosition} />
        
        {/* Camera Controller - follows planet */}
        <CameraController planetPosition={planetPosition} isSimulating={isSimulating} />
        
        {/* Camera controls - disabled when following planet */}
        <OrbitControls 
          enabled={!isSimulating}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      </Canvas>
    </div>
  );
}