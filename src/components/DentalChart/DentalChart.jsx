import React from 'react';
import '../../styles/pagedetails/DentalChart.css';

/* ─── FDI tooth type by position digit ─── */
const getToothType = (num) => {
  const pos = num % 10;
  if (pos >= 6) return 'molar';
  if (pos >= 4) return 'premolar';
  if (pos === 3) return 'canine';
  if (pos === 2) return 'lateral';
  return 'central';
};

/* ─── Shape config: crownW, crownH, rootHeights[] ─── */
const SHAPES = {
  molar:    { crownW: 34, crownH: 18, roots: [20, 28, 20] },
  premolar: { crownW: 24, crownH: 16, roots: [24, 24] },
  canine:   { crownW: 18, crownH: 20, roots: [36] },
  lateral:  { crownW: 14, crownH: 14, roots: [26] },
  central:  { crownW: 18, crownH: 16, roots: [28] },
};

/* ─── Arch layouts ─── */
const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

/* ─── Single tooth ─── */
const Tooth = ({ number, isUpper, isPending, assignedColor, onToggle }) => {
  const type = getToothType(number);
  const shape = SHAPES[type];
  const activeColor = assignedColor || (isPending ? '#64748B' : null);

  const crownStyle = activeColor
    ? { width: shape.crownW, height: shape.crownH, background: activeColor, borderColor: activeColor }
    : { width: shape.crownW, height: shape.crownH };

  const rootStyle = (h) =>
    activeColor
      ? { height: h, background: `${activeColor}99`, borderColor: `${activeColor}88` }
      : { height: h };

  const rootsEl = (
    <div className={`tooth__roots tooth__roots--${isUpper ? 'upper' : 'lower'}`}>
      {shape.roots.map((h, i) => (
        <div
          key={i}
          className={`tooth__root tooth__root--${isUpper ? 'upper' : 'lower'}`}
          style={rootStyle(h)}
        />
      ))}
    </div>
  );

  const crownEl = (
    <div
      className={`tooth__crown tooth__crown--${isUpper ? 'upper' : 'lower'}`}
      style={crownStyle}
    />
  );

  const isAssigned = !!assignedColor;
  const cls = [
    'tooth-btn',
    `tooth-btn--${type}`,
    isPending && 'tooth-btn--pending',
    isAssigned && 'tooth-btn--assigned',
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={cls}
      onClick={() => onToggle(number)}
      title={`Tooth ${number}${isPending ? ' (selected)' : isAssigned ? ' (assigned)' : ''}`}
      aria-label={`Tooth ${number}`}
      aria-pressed={isPending || isAssigned}
    >
      {isUpper ? (
        <>
          <span className="tooth__label">{number}</span>
          {rootsEl}
          {crownEl}
        </>
      ) : (
        <>
          {crownEl}
          {rootsEl}
          <span className="tooth__label">{number}</span>
        </>
      )}
    </button>
  );
};

/* ─── Legend item ─── */
const LEGEND = [
  { label: 'Pending', color: '#64748B' },
  { label: 'Caries', color: '#3B82F6' },
  { label: 'Extraction', color: '#EF4444' },
  { label: 'Remaining Root', color: '#F97316' },
];

/* ─── Main chart ─── */
export default function DentalChart({
  pendingTeeth = new Set(),
  toothColorMap = {},
  onToothToggle,
  disabled = false,
}) {
  const renderArch = (teeth, isUpper) =>
    teeth.map((n, idx) => {
      const isMidline = idx === 8;
      return (
        <React.Fragment key={n}>
          {isMidline && <div className="dental-chart__midline-gap" />}
          <Tooth
            number={n}
            isUpper={isUpper}
            isPending={pendingTeeth.has(n)}
            assignedColor={toothColorMap[n] || null}
            onToggle={disabled ? () => {} : onToothToggle}
          />
        </React.Fragment>
      );
    });

  const hint = disabled
    ? 'Complete patient information above to activate the dental chart.'
    : pendingTeeth.size > 0
    ? `${pendingTeeth.size} tooth${pendingTeeth.size > 1 ? ' teeth' : ''} selected — assign a diagnosis below.`
    : 'Click teeth to select them. Multiple teeth can be selected at once.';

  return (
    <div className={`dental-chart${disabled ? ' dental-chart--disabled' : ''}`}>
      {/* Legend */}
      <div className="dental-chart__legend">
        {LEGEND.map((l) => (
          <div key={l.label} className="dental-chart__legend-item">
            <span className="dental-chart__legend-dot" style={{ background: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Scrollable chart */}
      <div className="dental-chart__scroll">
        <div className="dental-chart__inner">
          {/* Quadrant labels — top */}
          <div className="dental-chart__qlabels dental-chart__qlabels--top">
            <span>Upper Right (Q1)</span>
            <span>Upper Left (Q2)</span>
          </div>

          {/* Upper arch */}
          <div className="dental-chart__arch dental-chart__arch--upper">
            {renderArch(UPPER, true)}
          </div>

          {/* Occlusal line */}
          <div className="dental-chart__occlusal" />

          {/* Lower arch */}
          <div className="dental-chart__arch dental-chart__arch--lower">
            {renderArch(LOWER, false)}
          </div>

          {/* Quadrant labels — bottom */}
          <div className="dental-chart__qlabels dental-chart__qlabels--bottom">
            <span>Lower Right (Q4)</span>
            <span>Lower Left (Q3)</span>
          </div>
        </div>
      </div>

      <p className="dental-chart__hint">{hint}</p>
    </div>
  );
}
