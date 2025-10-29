"use client"

import { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PresentationControls, Stage } from "@react-three/drei"
import { Loader } from "lucide-react"

interface Model3DViewerProps {
  modelPath: string
}

function ModelContent({ modelPath }: { modelPath: string }) {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <PresentationControls speed={1.5} global zoom={1} rotation={[0, 0, 0]}>
        <Stage environment="city" intensity={0.6}>
          <mesh onLoad={() => setLoading(false)} scale={1}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial
              color="#66ccff"
              metalness={0.8}
              roughness={0.2}
              emissive="#1a1a2e"
              emissiveIntensity={0.3}
            />
          </mesh>
        </Stage>
      </PresentationControls>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader className="w-6 h-6 animate-spin text-accent" />
        </div>
      )}
    </>
  )
}

export default function Model3DViewer({ modelPath }: Model3DViewerProps) {
  return (
    <div className="w-full h-full">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <Loader className="w-6 h-6 animate-spin text-accent" />
          </div>
        }
      >
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }} style={{ width: "100%", height: "100%" }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <ModelContent modelPath={modelPath} />
          <OrbitControls autoRotate autoRotateSpeed={4} enableZoom={true} enablePan={false} />
        </Canvas>
      </Suspense>
    </div>
  )
}
