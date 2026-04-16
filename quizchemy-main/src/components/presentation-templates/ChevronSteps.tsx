import React from 'react';

interface Step {
  label: string;
  color: string;
  description?: string;
}

interface ChevronStepsProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
}

export const ChevronSteps: React.FC<ChevronStepsProps> = ({ steps, orientation = 'horizontal' }) => {
  if (orientation === 'vertical') {
    const width = 320;
    const height = 70;
    const arrowSize = 15;
    const gap = 10; // Gap between chevrons

    return (
      <svg width={width} height={steps.length * (height + gap) - gap} viewBox={`0 0 ${width} ${steps.length * (height + gap) - gap}`}>
        {steps.map((step, i) => (
          <g key={i} transform={`translate(0, ${i * (height + gap)})`}>
            {/* Chevron polygon pointing down */}
            <polygon
              points={`0,0 ${width},0 ${width},${height - arrowSize} ${width / 2},${height} 0,${height - arrowSize}`}
              fill={step.color}
            />
            {/* Step label */}
            <text
              x={width / 2}
              y={(height - arrowSize) / 2}
              alignmentBaseline="middle"
              textAnchor="middle"
              fontSize="16"
              fontFamily="Inter, sans-serif"
              fontWeight="600"
              fill="white"
            >
              {step.label}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  // Horizontal orientation (original)
  const width = 200;
  const height = 60;

  return (
    <svg width={steps.length * width} height={height} viewBox={`0 0 ${steps.length * width} ${height}`}>
      {steps.map((step, i) => (
        <g key={i} transform={`translate(${i * width}, 0)`}>
          <polygon
            points={`0,0 ${width - 15},0 ${width},30 ${width - 15},60 0,60 15,30`}
            fill={step.color}
          />
          <text
            x={(width - 15) / 2}
            y={height / 2}
            alignmentBaseline="middle"
            textAnchor="middle"
            fontSize="16"
            fontFamily="Inter, sans-serif"
            fontWeight="600"
            fill="white"
          >
            {step.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default ChevronSteps;
