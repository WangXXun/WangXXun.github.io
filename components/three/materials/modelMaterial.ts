import * as THREE from "three";
import { noiseGLSL } from "./glsl";

/** Physical model variants, in the order they appear in 01 DESIGN. */
export const VARIANTS = ["white", "paper", "foam", "board", "wood", "print", "glulam"] as const;
export type Variant = (typeof VARIANTS)[number];
export const VARIANT_LABEL: Record<Variant, string> = {
  white: "WHITE MODEL",
  paper: "CARDBOARD",
  foam: "FLORAL FOAM",
  board: "WOOD BOARD",
  wood: "TIMBER MODEL",
  print: "3D PRINT",
  glulam: "GLULAM",
};

export interface ModelUniforms {
  uFrom: { value: number };
  uTo: { value: number };
  /** 0 → uFrom everywhere, 1 → uTo everywhere; swept bottom → top. */
  uMix: { value: number };
  /** Iso-line net overlay strength. */
  uLines: { value: number };
  uLineProgress: { value: number };
  /** Half-extent of the object in local units, for edge detection. */
  uHalf: { value: THREE.Vector3 };
  /** Pattern frequency scale (1 = pattern sized for a 1-unit object). */
  uPatternScale: { value: number };
  uTime: { value: number };
  uEdgeColor: { value: THREE.Color };
  uInk: { value: THREE.Color };
  /** Fragments above this normalised height are discarded (reveal / dissolve). */
  uCut: { value: number };
  uCutDir: { value: number };
  uTint: { value: THREE.Color };
}

export interface ModelMaterialOptions {
  /**
   * Where procedural patterns live: object-local (default, uses uHalf for edges),
   * world, or instance-local (instanced assemblies that must look the same at any scale).
   */
  patternSpace?: "local" | "world" | "instance";
  variant?: Variant;
  half?: THREE.Vector3;
  patternScale?: number;
}

const vertexHead = /* glsl */ `
varying vec3 vPat;
varying vec3 vLocalN;
`;

const fragmentHead = /* glsl */ `
varying vec3 vPat;
varying vec3 vLocalN;
uniform float uFrom;
uniform float uTo;
uniform float uMix;
uniform float uLines;
uniform float uLineProgress;
uniform vec3 uHalf;
uniform float uPatternScale;
uniform float uTime;
uniform vec3 uEdgeColor;
uniform vec3 uInk;
uniform float uCut;
uniform float uCutDir;
uniform vec3 uTint;
${noiseGLSL}

struct Surf { vec3 albedo; float rough; float height; float clear; };

// Distance from the current point to the nearest box edge, on the face.
float xs_edgeDist(vec3 p) {
  vec3 d = uHalf - abs(p);
  // The smallest component is the face we're on; the second smallest is the edge distance.
  float a = d.x, b = d.y, c = d.z;
  float lo = min(a, min(b, c));
  float hi = max(a, max(b, c));
  return a + b + c - lo - hi;
}

Surf xs_white(vec3 p) {
  float g = xs_vnoise(p * 38.0) * 0.6 + xs_vnoise(p * 9.0) * 0.4;
  return Surf(vec3(0.975, 0.972, 0.962) * (0.992 + 0.012 * g), 0.78, g * 0.00012, 0.0);
}

Surf xs_paper(vec3 p, float edge) {
  vec3 q = p * vec3(420.0, 90.0, 420.0);
  float fiber = xs_vnoise(q) * 0.6 + xs_vnoise(p * vec3(60.0, 700.0, 60.0)) * 0.4;
  vec3 col = vec3(0.965, 0.963, 0.952) * (0.975 + 0.03 * fiber);
  float h = fiber * 0.00012;
  // Foam-core card: paper skin | pale core | paper skin, visible on cut edges.
  float w = 0.016;
  if (edge < w) {
    float t = edge / w;
    float core = smoothstep(0.18, 0.26, t) * (1.0 - smoothstep(0.74, 0.82, t));
    col = mix(vec3(0.93, 0.925, 0.91), vec3(0.985, 0.975, 0.94), core);
    col *= 0.9 + 0.1 * xs_vnoise(p * 900.0);
    h -= 0.0008 * core;
  }
  return Surf(col, 0.9, h, 0.0);
}

Surf xs_foam(vec3 p, float edge) {
  float cells = xs_worley(p * 70.0);
  float pores = 1.0 - smoothstep(0.08, 0.32, cells);
  float grain = xs_fbm(p * 26.0);
  vec3 base = mix(vec3(0.40, 0.47, 0.36), vec3(0.52, 0.58, 0.46), grain);
  vec3 col = mix(base, base * 0.42, pores);
  // Crumbled, darker edges.
  float crumb = smoothstep(0.035, 0.0, edge + (xs_fbm(p * 40.0) - 0.5) * 0.03);
  col = mix(col, col * 0.62, crumb);
  float h = -pores * 0.004 - crumb * 0.003 + grain * 0.002;
  return Surf(col, 1.0, h, 0.0);
}

// Laminated timber board: thin plies stacked along Y, pale basswood faces.
Surf xs_board(vec3 p, float edge, vec3 n) {
  float plyCount = 7.0;
  float lp = (p.y / (2.0 * uHalf.y) + 0.5) * plyCount;
  float ply = fract(lp);
  float fw = fwidth(lp);
  float glue = (1.0 - smoothstep(0.0, max(0.035, fw * 1.5), ply)) + smoothstep(1.0 - max(0.035, fw * 1.5), 1.0, ply);
  float sheet = xs_hash31(vec3(floor(lp), 3.0, 7.0));
  float grain = xs_vnoise(p * vec3(5.0, 90.0, 26.0));
  float streak = xs_vnoise(p * vec3(2.0, 30.0, 160.0));
  vec3 col = mix(vec3(0.90, 0.80, 0.64), vec3(0.96, 0.89, 0.76), grain * 0.6 + streak * 0.4);
  col *= 0.96 + 0.06 * sheet;
  float onSide = 1.0 - abs(n.y);
  col = mix(col, col * 0.82, glue * onSide);
  float h = grain * 0.0003 - glue * onSide * 0.0005;
  return Surf(col, 0.7, h, 0.0);
}

// Solid timber: growth rings around an axis along X, end grain on ±X faces.
Surf xs_wood(vec3 p, vec3 n) {
  vec3 q = p * uPatternScale;
  vec2 axis = q.yz + vec2(0.9, -1.4);
  float warp = xs_fbm(q * vec3(1.2, 3.0, 3.0)) * 0.9;
  float r = length(axis * vec2(1.0, 0.8)) * 9.0 + warp * 2.2;
  float ring = fract(r);
  float late = smoothstep(0.55, 0.95, ring) * (1.0 - smoothstep(0.95, 1.0, ring));
  float fibre = xs_vnoise(q * vec3(3.0, 160.0, 160.0));
  vec3 early = vec3(0.86, 0.67, 0.46);
  vec3 lateC = vec3(0.64, 0.41, 0.24);
  vec3 col = mix(early, lateC, late * 0.85) * (0.93 + 0.1 * fibre);
  float endGrain = abs(n.x);
  col = mix(col, col * 0.8, endGrain * 0.6);
  float h = -late * 0.0008 + fibre * 0.0002;
  return Surf(col, mix(0.55, 0.78, late), h, 0.12);
}

// FDM print: fine horizontal layer lines along Y, faint sheen.
Surf xs_print(vec3 p) {
  float layers = 150.0;
  float lp = p.y / (2.0 * uHalf.y) * layers;
  float fw = fwidth(lp);
  float fade = 1.0 - smoothstep(0.25, 0.7, fw);
  float line = (0.5 + 0.5 * cos(lp * 6.2831853)) * fade;
  float wob = xs_vnoise(vec3(p.xz * 30.0, floor(lp) * 0.37));
  vec3 col = vec3(0.93, 0.935, 0.94) * (0.985 + 0.015 * wob) * (0.975 + 0.025 * line);
  float h = line * 0.00018;
  return Surf(col, 0.4 - line * 0.06, h, 0.3);
}

// Glue-laminated timber in metres: lamellas along Y, streaky grain along Z.
Surf xs_glulam(vec3 p, vec3 n) {
  float lp = p.y / 0.042;
  float fw = fwidth(lp);
  float fade = 1.0 - smoothstep(0.3, 0.8, fw);
  float lam = fract(lp);
  float glue = (1.0 - smoothstep(0.0, 0.06, lam) * (1.0 - smoothstep(0.94, 1.0, lam))) * fade;
  float board = xs_hash31(vec3(floor(lp), floor(p.z / 1.3), floor(p.x * 7.0)));
  float detail = 1.0 - smoothstep(0.15, 0.6, fwidth(p.y * 90.0));
  float streak = mix(0.5, xs_vnoise(p * vec3(60.0, 90.0, 2.5)) * 0.6 + xs_vnoise(p * vec3(160.0, 240.0, 6.0)) * 0.4, detail);
  vec3 col = mix(vec3(0.80, 0.64, 0.45), vec3(0.88, 0.74, 0.55), streak);
  col *= 0.92 + 0.12 * board;
  col = mix(col, col * 0.72, glue * 0.8);
  float endGrain = abs(n.z);
  col = mix(col, col * 0.78, endGrain);
  return Surf(col, 0.62, (-glue * 0.0015 + streak * 0.0004) * detail, 0.08);
}

Surf xs_variant(float v, vec3 p, float edge, vec3 n) {
  if (v > 5.5) return xs_glulam(p, n);
  if (v < 0.5) return xs_white(p);
  if (v < 1.5) return xs_paper(p, edge);
  if (v < 2.5) return xs_foam(p, edge);
  if (v < 3.5) return xs_board(p, edge, n);
  if (v < 4.5) return xs_wood(p, n);
  return xs_print(p);
}
`;

export function createModelMaterial(opts: ModelMaterialOptions = {}) {
  const variantIndex = VARIANTS.indexOf(opts.variant ?? "white");
  const uniforms: ModelUniforms = {
    uFrom: { value: variantIndex },
    uTo: { value: variantIndex },
    uMix: { value: 0 },
    uLines: { value: 0 },
    uLineProgress: { value: 1 },
    uHalf: { value: opts.half ?? new THREE.Vector3(0.5, 0.5, 0.5) },
    uPatternScale: { value: opts.patternScale ?? 1 },
    uTime: { value: 0 },
    uEdgeColor: { value: new THREE.Color("#FF4F1A") },
    uInk: { value: new THREE.Color("#1A1A1A") },
    uCut: { value: 2 },
    uCutDir: { value: 1 },
    uTint: { value: new THREE.Color(1, 1, 1) },
  };

  const mat = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: 0.8,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.4,
    sheen: 0.15,
    sheenRoughness: 0.8,
    sheenColor: new THREE.Color("#ffffff"),
  });

  const space = opts.patternSpace ?? "local";
  const worldPattern = space !== "local";

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${vertexHead}`)
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        ${
          space === "world"
            ? `
          #ifdef USE_INSTANCING
            vPat = (modelMatrix * instanceMatrix * vec4(position, 1.0)).xyz;
          #else
            vPat = (modelMatrix * vec4(position, 1.0)).xyz;
          #endif
          vLocalN = normal;`
            : space === "instance"
              ? `
          #ifdef USE_INSTANCING
            vPat = (instanceMatrix * vec4(position, 1.0)).xyz;
          #else
            vPat = position;
          #endif
          vLocalN = normal;`
              : `vPat = position; vLocalN = normal;`
        }`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${fragmentHead}`)
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
        vec3 xsP = vPat;
        vec3 xsN = normalize(vLocalN);
        float xsEdge = ${worldPattern ? "1.0" : "xs_edgeDist(xsP)"};
        float xsY = ${worldPattern ? "0.5" : "xsP.y / (2.0 * uHalf.y) + 0.5"};
        if ((xsY - uCut) * uCutDir > 0.0) discard;
        float xsCutSeam = uCut < 1.5 ? (1.0 - smoothstep(0.0, 0.008, abs(xsY - uCut))) : 0.0;
        float xsFront = uMix * 1.16 - 0.08 + (xs_vnoise(xsP * 9.0) - 0.5) * 0.06;
        float xsSel = step(xsY, xsFront);
        Surf xsS;
        if (xsSel > 0.5) xsS = xs_variant(uTo, xsP, xsEdge, xsN);
        else xsS = xs_variant(uFrom, xsP, xsEdge, xsN);
        float xsSeam = (uMix > 0.001 && uMix < 0.999) ? (1.0 - smoothstep(0.0, 0.006, abs(xsY - xsFront))) : 0.0;

        // Parametric iso-line net, bent by a smooth field.
        float xsLine = 0.0;
        if (uLines > 0.001) {
          vec3 lp = xsP / (2.0 * uHalf);
          float bend = xs_vnoise(lp * 2.3 + 3.1) - 0.5;
          vec2 uv = abs(xsN.y) > 0.5 ? lp.xz : (abs(xsN.x) > 0.5 ? lp.zy : lp.xy);
          vec2 g = (uv + bend * 0.18) * 9.0;
          vec2 fw2 = fwidth(g);
          vec2 d = abs(fract(g - 0.5) - 0.5) / max(fw2, vec2(1e-4));
          float grid = 1.0 - min(min(d.x, d.y), 1.0);
          float reveal = step(xsY, uLineProgress * 1.1 - 0.05);
          xsLine = grid * uLines * reveal;
        }
        `,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        diffuseColor.rgb = mix(xsS.albedo * uTint, uInk, xsLine * 0.82);`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        roughnessFactor = xsS.rough;`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
        {
          float hh = xsS.height;
          vec3 dpdx = dFdx(-vViewPosition);
          vec3 dpdy = dFdy(-vViewPosition);
          float dhdx = dFdx(hh);
          float dhdy = dFdy(hh);
          vec3 r1 = cross(dpdy, normal);
          vec3 r2 = cross(normal, dpdx);
          float det = dot(dpdx, r1);
          vec3 grad = sign(det) * (dhdx * r1 + dhdy * r2);
          normal = normalize(abs(det) * normal - grad);
        }`,
      )
      .replace(
        "#include <lights_physical_fragment>",
        `#include <lights_physical_fragment>
        #ifdef USE_CLEARCOAT
          material.clearcoat = xsS.clear;
        #endif`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        totalEmissiveRadiance += uEdgeColor * max(xsSeam, xsCutSeam) * 1.6;`,
      );
  };

  mat.customProgramCacheKey = () => `xs-model-${space}`;

  return { material: mat, uniforms };
}
