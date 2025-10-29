"use client"

import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"

interface ModelProps {
  modelPath: string
}

export default function Model({ modelPath }: ModelProps) {
  const { scene } = useGLTF(modelPath)
  const meshRef = useRef(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  return <primitive ref={meshRef} object={scene} scale={1.5} />
}
