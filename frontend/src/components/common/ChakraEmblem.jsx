// ======================================
// Official Chakra Emblem (SVG)
// ======================================

/**
 * Institutional 24-spoke chakra-style national emblem.
 * Uses currentColor so it can be tinted via text-* classes.
 */
export default function ChakraEmblem({ className = "h-10 w-10" }) {
  const spokes = Array.from({ length: 24 });

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      aria-label="National emblem"
      role="img"
    >
      {/* outer ring */}
      <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth="4.5" fill="none" />
      {/* inner ring */}
      <circle cx="50" cy="50" r="33" stroke="currentColor" strokeWidth="1.4" fill="none" />
      {/* 24 spokes */}
      {spokes.map((_, i) => (
        <line
          key={`s-${i}`}
          x1="50"
          y1="17"
          x2="50"
          y2="33"
          stroke="currentColor"
          strokeWidth="1.4"
          transform={`rotate(${i * 15} 50 50)`}
        />
      ))}
      {/* 24 dots at the ring */}
      {spokes.map((_, i) => (
        <circle
          key={`d-${i}`}
          cx="50"
          cy="9"
          r="1.9"
          fill="currentColor"
          transform={`rotate(${i * 15} 50 50)`}
        />
      ))}
      {/* hub */}
      <circle cx="50" cy="50" r="6" fill="currentColor" stroke="white" strokeWidth="1.8" />
    </svg>
  );
}