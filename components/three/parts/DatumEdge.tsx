"use client";

import { COLORS } from "@/lib/story";

/** The signal-orange datum edge on the front-right vertical edge of a unit block. */
export function DatumEdge({ radius = 0.035, thickness = 0.012 }: { radius?: number; thickness?: number }) {
  const off = 0.5 - radius + radius * Math.SQRT1_2 + thickness * 0.2;
  return (
    <mesh position={[off, 0, off]} rotation-y={Math.PI / 4}>
      <boxGeometry args={[thickness, 1 - radius * 2, thickness]} />
      <meshStandardMaterial color={COLORS.orange} emissive={COLORS.orange} emissiveIntensity={0.35} roughness={0.5} />
    </mesh>
  );
}
