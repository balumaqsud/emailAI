import type { SVGAttributes } from "react";

export interface DonutChartProps extends SVGAttributes<SVGSVGElement> {
  segments?: { value: number; color: string }[];
}

// Simple decorative donut chart for the sidebar stats panel
export function DonutChart({
  segments = [
    { value: 60, color: "#38bdf8" },
    { value: 25, color: "#22c55e" },
    { value: 15, color: "#f97316" },
  ],
  ...props
}: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let cumulative = 0;

  return (
    <svg viewBox="0 0 120 120" className="h-32 w-32" {...props}>
      <circle
        cx="60"
        cy="60"
        r="40"
        fill="transparent"
        stroke="#e5e7eb"
        strokeWidth="14"
      />
      {segments.map((segment, index) => {
        const startAngle = (cumulative / total) * 2 * Math.PI;
        const segmentAngle = (segment.value / total) * 2 * Math.PI;
        cumulative += segment.value;

        const x1 = 60 + 40 * Math.cos(startAngle);
        const y1 = 60 + 40 * Math.sin(startAngle);
        const x2 = 60 + 40 * Math.cos(startAngle + segmentAngle);
        const y2 = 60 + 40 * Math.sin(startAngle + segmentAngle);

        const largeArcFlag = segmentAngle > Math.PI ? 1 : 0;

        const d = [
          `M ${x1} ${y1}`,
          `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        ].join(" ");

        return (
          <path
            key={index}
            d={d}
            stroke={segment.color}
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="60" cy="60" r="25" fill="white" />
    </svg>
  );
}

