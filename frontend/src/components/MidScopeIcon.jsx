import React from "react";

/**
 * MidScopeIcon — unified front-facing brand icon.
 * Symmetric, viewer-facing composition that balances the three diagnostic pillars:
 *   • Lab (droplet, centred bottom)
 *   • Radiology / Sonar (concentric scanning arcs, centred top)
 *   • ECG (pulse line, centred middle)
 * Microscope is intentionally NOT the focus — this icon represents the whole platform.
 *
 * Designed to look directly at the viewer (front-elevation, no perspective skew),
 * matching the Royal tier's high-end, crystalline aesthetic.
 */
export default function MidScopeIcon({
  className = "w-5 h-5",
  color = "currentColor",
  strokeWidth = 2,
  title = "MidScope",
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
      data-testid="midscope-icon"
    >
      <title>{title}</title>
      <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {/* Radiology / sonar arcs — top, centred, symmetric */}
        <path d="M9 9.5 A8 8 0 0 1 23 9.5" opacity="0.95" />
        <path d="M11.5 12 A5 5 0 0 1 20.5 12" opacity="0.65" />

        {/* ECG pulse line — middle, dead-centre, viewer-facing */}
        <path d="M5 17 H11 L13 13 L16 21 L19 13 L21 17 H27" />

        {/* Lab droplet — bottom centre, symmetrical */}
        <path d="M16 22 C13.8 24.5 13.8 27.5 16 28 C18.2 27.5 18.2 24.5 16 22 Z" fill={color} fillOpacity="0.18" />
      </g>
    </svg>
  );
}
