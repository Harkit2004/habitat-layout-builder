import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Home, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Physics constants and calculations
const G = 6.67430e-11; // Gravitational constant (m³/kg⋅s²)
const AU = 1.496e11; // Astronomical unit (meters)
const SCALE_FACTOR = 1e-9; // Scale factor for visualization

// Mass definitions (kg)
const STAR_MASS = 1.989e30; // Sun mass
const PLANET_BASE_MASS = 5.972e24; // Earth mass
const STATION_BASE_MASS = 420000; // ISS mass

interface OrbitalPhysics {
  mass: number;
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  orbitalVelocity: number;
  angularVelocity: number;
  period: number;
  modelUrl?: string | null;
}

// Physics calculation functions
function calculateOrbitalVelocity(centralMass: number, semiMajorAxis: number, currentRadius: number): number {
  // v = √(GM * (2/r - 1/a))
  return Math.sqrt(G * centralMass * (2 / currentRadius - 1 / semiMajorAxis));
}

function calculateOrbitalPeriod(centralMass: number, semiMajorAxis: number): number {
  // T = 2π√(a³/GM)
  return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / (G * centralMass));
}

function calculateAngularVelocity(velocity: number, radius: number): number {
  // ω = v / r
  return velocity / radius;
}

function applyPerturbations(baseMass: number, perturbingMass: number, distance: number): number {
  // Simple gravitational perturbation effect
  const perturbationFactor = (perturbingMass / baseMass) * (1 / Math.pow(distance, 2));
  return Math.min(perturbationFactor * 0.001, 0.1); // Limit perturbation effect
}

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

// Elliptical orbit ring component with dynamic path
function EllipticalOrbitRing({ 
  eccentricity, 
  inclination 
}: { 
  eccentricity: number,
  inclination: number 
}) {
  const lineRef = useRef<THREE.Line>(null);
  
  // Update orbit ring when eccentricity changes (with small perturbation from inclination)
  React.useEffect(() => {
    if (lineRef.current) {
      const points = [];
      const semiMajorAxis = 60;
      const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
      const focalDistance = semiMajorAxis * eccentricity; // Proper focal distance
      
      // Generate points along the ellipse with small perturbation from station inclination
      for (let i = 0; i <= 128; i++) {
        const angle = (i / 128) * Math.PI * 2;
        const x = -focalDistance + semiMajorAxis * Math.cos(angle); // Offset so star is at focus
        const z = semiMinorAxis * Math.sin(angle);
        
        // Small perturbation from station inclination (subtle effect)
        const perturbationFactor = inclination * 0.1;
        const perturbedY = z * Math.sin(perturbationFactor) * 0.2; // Small vertical displacement
        const perturbedZ = z * Math.cos(perturbationFactor);
        
        points.push(new THREE.Vector3(x, perturbedY, perturbedZ));
      }
      
      const newGeometry = new THREE.BufferGeometry().setFromPoints(points);
      lineRef.current.geometry.dispose();
      lineRef.current.geometry = newGeometry;
    }
  }, [eccentricity, inclination]);
  
  // Create initial geometry
  const createInitialPath = () => {
    const points = [];
    const semiMajorAxis = 60;
    const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
    const focalDistance = semiMajorAxis * eccentricity; // Proper focal distance
    
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      const x = -focalDistance + semiMajorAxis * Math.cos(angle); // Offset so star is at focus
      const z = semiMinorAxis * Math.sin(angle);
      
      // Small perturbation from station inclination
      const perturbationFactor = inclination * 0.1;
      const perturbedY = z * Math.sin(perturbationFactor) * 0.2;
      const perturbedZ = z * Math.cos(perturbationFactor);
      
      points.push(new THREE.Vector3(x, perturbedY, perturbedZ));
    }
    
    return new THREE.BufferGeometry().setFromPoints(points);
  };
  
  const geometry = createInitialPath();
  
  return (
    <primitive 
      ref={lineRef}
      object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ 
        color: 'cyan', 
        transparent: true, 
        opacity: 0.4 
      }))} 
    />
  );
}

// Space Station orbit ring component
function SpaceStationOrbitRing({ 
  isSimulating, 
  planetPosition, 
  inclination 
}: { 
  isSimulating: boolean, 
  planetPosition: THREE.Vector3, 
  inclination: number 
}) {
  const ringGroupRef = useRef<THREE.Group>(null);
  const lineRef = useRef<THREE.Line>(null);
  
  // Update orbit ring when inclination changes
  React.useEffect(() => {
    if (lineRef.current) {
      const points = [];
      const radius = 8;
      
      // Generate points along the circle with proper inclination rotation
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const orbitalX = Math.cos(angle) * radius;
        const orbitalY = 0; // Start in orbital plane
        const orbitalZ = Math.sin(angle) * radius;
        
        // Apply inclination rotation around X-axis
        const inclinedY = orbitalY * Math.cos(inclination) - orbitalZ * Math.sin(inclination);
        const inclinedZ = orbitalY * Math.sin(inclination) + orbitalZ * Math.cos(inclination);
        
        points.push(new THREE.Vector3(orbitalX, inclinedY, inclinedZ));
      }
      
      const newGeometry = new THREE.BufferGeometry().setFromPoints(points);
      lineRef.current.geometry.dispose();
      lineRef.current.geometry = newGeometry;
    }
  }, [inclination]);
  
  // Create initial circular path
  const createCircularPath = () => {
    const points = [];
    const radius = 8;
    
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      const orbitalX = Math.cos(angle) * radius;
      const orbitalY = 0;
      const orbitalZ = Math.sin(angle) * radius;
      
      // Apply inclination rotation around X-axis
      const inclinedY = orbitalY * Math.cos(inclination) - orbitalZ * Math.sin(inclination);
      const inclinedZ = orbitalY * Math.sin(inclination) + orbitalZ * Math.cos(inclination);
      
      points.push(new THREE.Vector3(orbitalX, inclinedY, inclinedZ));
    }
    
    return new THREE.BufferGeometry().setFromPoints(points);
  };
  
  const geometry = createCircularPath();
  
  useFrame(() => {
    if (ringGroupRef.current) {
      // Always position ring at planet location (whether simulating or not)
      ringGroupRef.current.position.copy(planetPosition);
    }
  });
  
  // Update ring position when planet position changes
  React.useEffect(() => {
    if (ringGroupRef.current) {
      ringGroupRef.current.position.copy(planetPosition);
    }
  }, [planetPosition]);
  
  return (
    <group ref={ringGroupRef}>
      <primitive 
        ref={lineRef}
        object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ 
          color: 'white', 
          transparent: true, 
          opacity: 0.4 
        }))} 
      />
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

// Planet component with realistic physics
function Planet({ 
  isSimulating, 
  onPositionUpdate, 
  planetPhysics, 
  stationPhysics 
}: { 
  isSimulating: boolean, 
  onPositionUpdate: (pos: THREE.Vector3, physics: OrbitalPhysics) => void,
  planetPhysics: OrbitalPhysics,
  stationPhysics: OrbitalPhysics
}) {
  const planetRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const timeOffset = useRef(0);
  
  // Force update position when parameters change
  React.useEffect(() => {
    if (planetRef.current && !isSimulating) {
      // Update position immediately when parameters change while paused
      const visualSemiMajorAxis = 60;
      const visualSemiMinorAxis = visualSemiMajorAxis * Math.sqrt(1 - planetPhysics.eccentricity * planetPhysics.eccentricity);
      const focalDistance = visualSemiMajorAxis * planetPhysics.eccentricity;
      
      const meanAnomaly = timeOffset.current || 0;
      const ellipseX = visualSemiMajorAxis * Math.cos(meanAnomaly);
      const ellipseZ = visualSemiMinorAxis * Math.sin(meanAnomaly);
      
      // Small gravitational perturbation from station inclination
      const perturbationFactor = stationPhysics.inclination * 0.1;
      const perturbedY = ellipseZ * Math.sin(perturbationFactor) * 0.2;
      const perturbedZ = ellipseZ * Math.cos(perturbationFactor);
      
      planetRef.current.position.x = -focalDistance + ellipseX;
      planetRef.current.position.z = perturbedZ;
      planetRef.current.position.y = perturbedY;
    }
  }, [planetPhysics.eccentricity, stationPhysics.inclination, isSimulating]);
  
  // Always update position callback for space station to follow
  React.useEffect(() => {
    if (planetRef.current) {
      onPositionUpdate(new THREE.Vector3(planetRef.current.position.x, planetRef.current.position.y, planetRef.current.position.z), planetPhysics);
    }
  });
  
  useFrame(({ clock }) => {
    if (planetRef.current) {
      // Always use current eccentricity for calculations
      const visualSemiMajorAxis = 60;
      const visualSemiMinorAxis = visualSemiMajorAxis * Math.sqrt(1 - planetPhysics.eccentricity * planetPhysics.eccentricity);
      const focalDistance = visualSemiMajorAxis * planetPhysics.eccentricity;
      
      let meanAnomaly;
      if (isSimulating) {
        // Update time when simulating
        const timeScale = 0.1;
        meanAnomaly = clock.getElapsedTime() * timeScale;
        timeOffset.current = meanAnomaly;
      } else {
        // Use stored time when paused
        meanAnomaly = timeOffset.current || 0;
      }
      
      // Calculate elliptical position (planet orbits mostly flat with small perturbation)
      const ellipseX = visualSemiMajorAxis * Math.cos(meanAnomaly);
      const ellipseZ = visualSemiMinorAxis * Math.sin(meanAnomaly);
      
      // Small gravitational perturbation from station inclination (affects planet motion slightly)
      const perturbationFactor = stationPhysics.inclination * 0.1; // Small effect
      const perturbedY = ellipseZ * Math.sin(perturbationFactor) * 0.2; // Slight tilt in motion
      const perturbedZ = ellipseZ * Math.cos(perturbationFactor);
      
      // Position planet (offset by focal distance so star is at focus)
      planetRef.current.position.x = -focalDistance + ellipseX;
      planetRef.current.position.z = perturbedZ;
      planetRef.current.position.y = perturbedY;
      
      // Calculate physics values based on current position
      const currentRadius = planetPhysics.semiMajorAxis;
      const currentVelocity = Math.sqrt(G * STAR_MASS / currentRadius); // Simplified circular velocity
      const currentAngularVelocity = currentVelocity / currentRadius;
      const currentPeriod = 2 * Math.PI * Math.sqrt(Math.pow(currentRadius, 3) / (G * STAR_MASS));
      
      // Update physics data with safe values
      const updatedPhysics: OrbitalPhysics = {
        ...planetPhysics,
        orbitalVelocity: isFinite(currentVelocity) ? currentVelocity : planetPhysics.orbitalVelocity,
        angularVelocity: isFinite(currentAngularVelocity) ? currentAngularVelocity : planetPhysics.angularVelocity,
        period: isFinite(currentPeriod) ? currentPeriod : planetPhysics.period
      };
      
      // Always report current position and physics for space station to follow
      onPositionUpdate(new THREE.Vector3(planetRef.current.position.x, planetRef.current.position.y, planetRef.current.position.z), updatedPhysics);
    }
    
    // Planet rotates on its own axis (affected by angular momentum)
    if (planetMeshRef.current) {
      const rotationRate = 0.3 * (planetPhysics.mass / PLANET_BASE_MASS);
      planetMeshRef.current.rotation.y = clock.getElapsedTime() * rotationRate;
    }
  });
  
  return (
    <group ref={planetRef}>
      {/* Planet mesh */}
      <mesh ref={planetMeshRef}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
    </group>
  );
}

// GLB Model Loader component
function GLBModel({ 
  url, 
  scale = 1
}: { 
  url: string, 
  scale?: number
}) {
  const gltf = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  
  React.useEffect(() => {
    if (groupRef.current && gltf?.scene) {
      // Clear any existing children
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }
      
      // Clone and add the scene
      const clonedScene = gltf.scene.clone();
      
      // Calculate proper centering
      const box = new THREE.Box3().setFromObject(clonedScene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Center the model at origin (like the sphere)
      clonedScene.position.set(-center.x, -center.y, -center.z);
      clonedScene.scale.set(scale, scale, scale);
      
      groupRef.current.add(clonedScene);
    }
  }, [gltf, scale]);
  
  if (!gltf || !gltf.scene) {
    return (
      <mesh>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial color="red" />
      </mesh>
    );
  }
  
  return <group ref={groupRef} />;
}

// Space Station component with realistic physics
function SpaceStation({ 
  isSimulating, 
  planetPosition, 
  stationPhysics, 
  planetPhysics 
}: { 
  isSimulating: boolean, 
  planetPosition: THREE.Vector3,
  stationPhysics: OrbitalPhysics,
  planetPhysics: OrbitalPhysics
}) {
  const stationRef = useRef<THREE.Group>(null);
  const timeOffset = useRef(0);
  
  // Update position when parameters change or planet moves
  React.useEffect(() => {
    if (stationRef.current && !isSimulating) {
      // Update position when parameters change while paused
      const visualOrbitRadius = 8;
      const meanAnomaly = timeOffset.current || 0;
      
      const orbitalX = visualOrbitRadius * Math.cos(meanAnomaly);
      const orbitalY = 0;
      const orbitalZ = visualOrbitRadius * Math.sin(meanAnomaly);
      
      const inclinedY = orbitalY * Math.cos(stationPhysics.inclination) - orbitalZ * Math.sin(stationPhysics.inclination);
      const inclinedZ = orbitalY * Math.sin(stationPhysics.inclination) + orbitalZ * Math.cos(stationPhysics.inclination);
      
      stationRef.current.position.x = planetPosition.x + orbitalX;
      stationRef.current.position.y = planetPosition.y + inclinedY;
      stationRef.current.position.z = planetPosition.z + inclinedZ;
    }
  }, [stationPhysics.inclination, planetPosition.x, planetPosition.y, planetPosition.z, isSimulating]);
  
  // Always update position when planet moves (even when simulating)
  React.useEffect(() => {
    if (stationRef.current) {
      const visualOrbitRadius = 8;
      const meanAnomaly = timeOffset.current || 0;
      
      const orbitalX = visualOrbitRadius * Math.cos(meanAnomaly);
      const orbitalY = 0;
      const orbitalZ = visualOrbitRadius * Math.sin(meanAnomaly);
      
      const inclinedY = orbitalY * Math.cos(stationPhysics.inclination) - orbitalZ * Math.sin(stationPhysics.inclination);
      const inclinedZ = orbitalY * Math.sin(stationPhysics.inclination) + orbitalZ * Math.cos(stationPhysics.inclination);
      
      // Update position and rotation relative to current planet position
      stationRef.current.position.x = planetPosition.x + orbitalX;
      stationRef.current.position.y = planetPosition.y + inclinedY;
      stationRef.current.position.z = planetPosition.z + inclinedZ;
      
      // Update rotation to align with orbital motion and inclination
      stationRef.current.rotation.y = meanAnomaly;
      stationRef.current.rotation.x = stationPhysics.inclination;
      stationRef.current.rotation.z = 0;
    }
  }, [planetPosition, stationPhysics.inclination]);
  
  useFrame(({ clock }) => {
    if (stationRef.current) {
      const visualOrbitRadius = 8; // Visual representation
      
      let meanAnomaly;
      if (isSimulating) {
        // Update time when simulating
        const timeScale = 2.0; // Fixed speed for visibility
        meanAnomaly = clock.getElapsedTime() * timeScale;
        timeOffset.current = meanAnomaly;
      } else {
        // Use stored time when paused
        meanAnomaly = timeOffset.current || 0;
      }
      
      // Calculate orbital position in the orbital plane
      const orbitalX = visualOrbitRadius * Math.cos(meanAnomaly);
      const orbitalY = 0; // Start in the orbital plane
      const orbitalZ = visualOrbitRadius * Math.sin(meanAnomaly);
      
      // Apply inclination rotation using current physics parameters
      // Rotate around X-axis by inclination angle
      const inclinedY = orbitalY * Math.cos(stationPhysics.inclination) - orbitalZ * Math.sin(stationPhysics.inclination);
      const inclinedZ = orbitalY * Math.sin(stationPhysics.inclination) + orbitalZ * Math.cos(stationPhysics.inclination);
      
      // Position relative to planet (always use current planet position)
      const finalX = planetPosition.x + orbitalX;
      const finalY = planetPosition.y + inclinedY;
      const finalZ = planetPosition.z + inclinedZ;
      
      stationRef.current.position.set(finalX, finalY, finalZ);
      
      // Debug logging (remove after testing)
      if (stationPhysics.modelUrl && Math.floor(meanAnomaly * 10) % 10 === 0) {
        console.log('Station position:', { 
          finalX: finalX.toFixed(2), 
          finalY: finalY.toFixed(2), 
          finalZ: finalZ.toFixed(2),
          orbitalX: orbitalX.toFixed(2),
          orbitalZ: orbitalZ.toFixed(2),
          meanAnomaly: meanAnomaly.toFixed(2)
        });
      }
      
      // Proper orbital rotation - align with velocity vector and inclination
      stationRef.current.rotation.set(
        stationPhysics.inclination, // X rotation matches inclination
        meanAnomaly,                // Y rotation follows orbital motion
        0                          // Z rotation neutral
      );
    }
  });
  
  return (
    <group ref={stationRef}>
      {/* Reference sphere - always visible for alignment */}
      <mesh>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial color="yellow" transparent opacity={stationPhysics.modelUrl ? 0.3 : 1.0} />
      </mesh>
      
      {/* GLB Model if loaded - should align exactly with sphere */}
      {stationPhysics.modelUrl && (
        <group>
          <GLBModel 
            url={stationPhysics.modelUrl} 
            scale={1}
          />
        </group>
      )}
    </group>
  );
}

export function OrbitalSimulator() {
  const navigate = useNavigate();
  const [isSimulating, setIsSimulating] = useState(false);
  const [planetPosition, setPlanetPosition] = useState(new THREE.Vector3(77.888, 0, 0));
  
  // Physics states
  const [planetPhysics, setPlanetPhysics] = useState<OrbitalPhysics>({
    mass: PLANET_BASE_MASS,
    semiMajorAxis: 1.5 * AU, // meters
    eccentricity: 0.2,
    inclination: 0.1, // radians
    orbitalVelocity: 29780, // Earth's orbital velocity in m/s
    angularVelocity: 1.991e-7, // Earth's angular velocity in rad/s
    period: 365.25 * 24 * 3600 // Earth's orbital period in seconds
  });
  
  const [stationPhysics, setStationPhysics] = useState<OrbitalPhysics>({
    mass: STATION_BASE_MASS,
    semiMajorAxis: 6.778e6, // ISS orbital radius in meters
    eccentricity: 0.05,
    inclination: 0.05,
    orbitalVelocity: 7660, // ISS velocity in m/s
    angularVelocity: 1.13e-3, // ISS angular velocity in rad/s
    period: 5580, // ISS period in seconds (93 minutes)
    modelUrl: null
  });
  
  // File input handler for GLB models
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.glb')) {
      const url = URL.createObjectURL(file);
      setStationPhysics({...stationPhysics, modelUrl: url});
    } else {
      alert('Please select a valid .glb file');
    }
  };
  
  const handlePlanetUpdate = (pos: THREE.Vector3, physics: OrbitalPhysics) => {
    setPlanetPosition(pos);
    setPlanetPhysics(physics);
  };
  
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
      <div className="absolute top-4 right-4 z-20 space-y-4">
        <Card className="bg-gray-900/90 text-white border-gray-600 w-80">
          <CardHeader>
            <CardTitle className="text-lg">Orbital Simulator</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setIsSimulating(!isSimulating)}
              className="w-full mb-4"
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
        
        {/* Physics Controls */}
        <Card className="bg-gray-900/90 text-white border-gray-600 w-80">
          <CardHeader>
            <CardTitle className="text-sm">Physics Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Constant Mass Display */}
            <div className="space-y-2 p-3 bg-gray-800 rounded-lg">
              <div className="text-xs text-gray-400">Constant Masses:</div>
              <div className="flex justify-between">
                <span className="text-xs">Planet Mass:</span>
                <span className="text-xs text-blue-400">{(planetPhysics.mass / 1e24).toFixed(2)} × 10²⁴ kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs">Station Mass:</span>
                <span className="text-xs text-yellow-400">{(stationPhysics.mass / 1000).toFixed(0)} tons</span>
              </div>
            </div>
            
            {/* Planet Eccentricity */}
            <div>
              <label className="text-xs text-gray-400 block">Planet Eccentricity: {planetPhysics.eccentricity.toFixed(3)}</label>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.01"
                value={planetPhysics.eccentricity}
                onChange={(e) => setPlanetPhysics({...planetPhysics, eccentricity: parseFloat(e.target.value)})}
                disabled={isSimulating}
                className={`w-full mt-2 rounded-lg ${isSimulating ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700'}`}
              />
              <div className="text-xs text-gray-500 mt-1">
                {isSimulating ? 'Pause simulation to adjust parameters' : 'Changes orbital shape from circular to elliptical'}
              </div>
            </div>
            
            {/* Station Inclination */}
            <div>
              <label className="text-xs text-gray-400 block">Station Inclination: {(stationPhysics.inclination * 180 / Math.PI).toFixed(1)}°</label>
              <input
                type="range"
                min="0"
                max="90"
                step="1"
                value={stationPhysics.inclination * 180 / Math.PI}
                onChange={(e) => setStationPhysics({...stationPhysics, inclination: parseFloat(e.target.value) * Math.PI / 180})}
                disabled={isSimulating}
                className={`w-full mt-2 rounded-lg ${isSimulating ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700'}`}
              />
              <div className="text-xs text-gray-500 mt-1">
                {isSimulating ? 'Pause simulation to adjust parameters' : 'Tilts the station\'s orbital plane'}
              </div>
            </div>
            
            {/* GLB Model Upload */}
            <div>
              <label className="text-xs text-gray-400 block mb-2">Space Station Model (.glb)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".glb"
                  onChange={handleFileUpload}
                  disabled={isSimulating}
                  className="hidden"
                  id="glb-upload"
                />
                <label 
                  htmlFor="glb-upload" 
                  className={`flex items-center px-3 py-2 text-xs rounded-lg cursor-pointer ${
                    isSimulating ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload GLB
                </label>
                {stationPhysics.modelUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStationPhysics({...stationPhysics, modelUrl: null})}
                    disabled={isSimulating}
                    className="text-xs px-2 py-1"
                  >
                    Reset
                  </Button>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stationPhysics.modelUrl ? 'Custom model loaded' : 'Upload a .glb file to replace the yellow sphere'}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Physics Display */}
        <Card className="bg-gray-900/90 text-white border-gray-600 w-80">
          <CardHeader>
            <CardTitle className="text-sm">Real-time Physics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Planet Velocity:</span>
              <Badge variant="secondary" className="text-xs">{(planetPhysics.orbitalVelocity / 1000).toFixed(1)} km/s</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Planet Period:</span>
              <Badge variant="secondary" className="text-xs">{(planetPhysics.period / (365.25 * 24 * 3600)).toFixed(2)} years</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Station Period:</span>
              <Badge variant="secondary" className="text-xs">{(stationPhysics.period / 3600).toFixed(2)} hours</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Angular Velocity:</span>
              <Badge variant="secondary" className="text-xs">{(planetPhysics.angularVelocity * 1e6).toFixed(2)} µrad/s</Badge>
            </div>
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
        <EllipticalOrbitRing 
          eccentricity={planetPhysics.eccentricity} 
          inclination={stationPhysics.inclination}
        />
        <SpaceStationOrbitRing 
          isSimulating={isSimulating} 
          planetPosition={planetPosition}
          inclination={stationPhysics.inclination}
        />
        
        {/* Central Star */}
        <CentralStar />
        
        {/* Planet */}
        <Planet 
          isSimulating={isSimulating} 
          onPositionUpdate={handlePlanetUpdate}
          planetPhysics={planetPhysics}
          stationPhysics={stationPhysics}
        />
        
        {/* Space Station */}
        <SpaceStation 
          isSimulating={isSimulating} 
          planetPosition={planetPosition}
          stationPhysics={stationPhysics}
          planetPhysics={planetPhysics}
        />
        
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