import React, { useState, useMemo, useCallback } from 'react';
import { getTreatmentColor } from '../../lib/studentData';
import '../../styles/student/PatientDentalChart.css';

/* ================================================================
   Shared constants — identical to DentalChart.jsx
   ================================================================ */

const getToothType = (num) => {
  const pos = num % 10;
  if (pos >= 6) return 'molar';
  if (pos >= 4) return 'premolar';
  if (pos === 3) return 'canine';
  if (pos === 2) return 'lateral';
  return 'central';
};

const SHAPES = {
  molar:    { crownW: 34, crownH: 18, roots: [20, 28, 20] },
  premolar: { crownW: 24, crownH: 16, roots: [24, 24] },
  canine:   { crownW: 18, crownH: 20, roots: [36] },
  lateral:  { crownW: 14, crownH: 14, roots: [26] },
  central:  { crownW: 18, crownH: 16, roots: [28] },
};

const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

/* ================================================================
   ReadOnlyTooth
   - Healthy teeth: rendered as <div>, no cursor, no interaction
   - Case teeth:    rendered as <button>, clickable, hover effect
   ================================================================ */

const ReadOnlyTooth = React.memo(function ReadOnlyTooth({
  number, isUpper, color, onMouseEnter, onMouseLeave, onClick,
}) {
  const hasCase = !!color;
  const type    = getToothType(number);
  const shape   = SHAPES[type];

  const crownStyle = color
    ? { width: shape.crownW, height: shape.crownH, background: color, borderColor: color }
    : { width: shape.crownW, height: shape.crownH };

  const rootStyle = (h) =>
    color
      ? { height: h, background: `${color}99`, borderColor: `${color}88` }
      : { height: h };

  const rootsEl = (
    <div className={`pdc-tooth__roots pdc-tooth__roots--${isUpper ? 'upper' : 'lower'}`}>
      {shape.roots.map((h, i) => (
        <div
          key={i}
          className={`pdc-tooth__root pdc-tooth__root--${isUpper ? 'upper' : 'lower'}`}
          style={rootStyle(h)}
        />
      ))}
    </div>
  );

  const crownEl = (
    <div
      className={`pdc-tooth__crown pdc-tooth__crown--${isUpper ? 'upper' : 'lower'}`}
      style={crownStyle}
    />
  );

  const label = <span className="pdc-tooth__label">{number}</span>;

  const inner = isUpper
    ? <>{label}{rootsEl}{crownEl}</>
    : <>{crownEl}{rootsEl}{label}</>;

  const baseCls = `pdc-tooth pdc-tooth--${type}`;

  /* Healthy tooth — non-interactive div */
  if (!hasCase) {
    return <div className={`${baseCls} pdc-tooth--healthy`}>{inner}</div>;
  }

  /* Case tooth — interactive button */
  return (
    <button
      type="button"
      className={`${baseCls} pdc-tooth--has-case`}
      onClick={() => onClick(number)}
      onMouseEnter={(e) => onMouseEnter(e, number)}
      onMouseLeave={onMouseLeave}
      onFocus={(e) => onMouseEnter(e, number)}
      onBlur={onMouseLeave}
      aria-label={`Tooth ${number} — click to see case details`}
    >
      {inner}
    </button>
  );
});

/* ================================================================
   PatientDentalChart
   Props:
     cases       - Array<{ tooth: number, diagnosis: string,
                           diagnosisLabel: string, status: string }>
     onToothClick - (tooth: number) => void
   ================================================================ */

export default function PatientDentalChart({ cases = [], onToothClick }) {
  /* Build lookup: tooth → case data */
  const toothCaseMap = useMemo(() => {
    const map = {};
    cases.forEach((c) => {
      if (c.tooth != null) map[c.tooth] = c;
    });
    return map;
  }, [cases]);

  /* Build lookup: tooth → shared treatment color */
  const toothColorMap = useMemo(() => {
    const map = {};
    cases.forEach((c) => {
      if (c.tooth != null && c.treatment) {
        map[c.tooth] = getTreatmentColor(c.treatment);
      }
    });
    return map;
  }, [cases]);

  /* Which legend items are actually present */
  const presentTreatments = useMemo(() => {
    const treatments = [...new Set(cases.map((c) => c.treatment).filter(Boolean))];
    return treatments.map((treatment) => ({ label: treatment, color: getTreatmentColor(treatment) }));
  }, [cases]);

  /* Fixed-position tooltip */
  const [tooltip, setTooltip] = useState(null);

  const handleMouseEnter = useCallback((e, number) => {
    const c = toothCaseMap[number];
    if (!c) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      number,
      diagnosisLabel: c.diagnosisLabel,
      status:         c.status,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  }, [toothCaseMap]);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const handleClick = useCallback((number) => {
    setTooltip(null);
    onToothClick?.(number);
  }, [onToothClick]);

  /* Render one arch */
  const renderArch = (teeth, isUpper) =>
    teeth.map((n, idx) => (
      <React.Fragment key={n}>
        {idx === 8 && <div className="pdc__midline-gap" />}
        <ReadOnlyTooth
          number={n}
          isUpper={isUpper}
          color={toothColorMap[n] || null}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />
      </React.Fragment>
    ));

  const caseCount = cases.length;

  return (
    <div className="pdc">
      {/* Legend */}
      {presentTreatments.length > 0 && (
        <div className="pdc__legend">
          {presentTreatments.map((treatment) => (
            <div key={treatment.label} className="pdc__legend-item">
              <span className="pdc__legend-dot" style={{ background: treatment.color }} />
              <span>{treatment.label}</span>
            </div>
          ))}
          <div className="pdc__legend-item pdc__legend-item--healthy">
            <span className="pdc__legend-dot pdc__legend-dot--healthy" />
            <span>Healthy</span>
          </div>
        </div>
      )}

      {/* Scrollable chart */}
      <div className="pdc__scroll">
        <div className="pdc__inner">
          <div className="pdc__qlabels pdc__qlabels--top">
            <span>Upper Right (Q1)</span>
            <span>Upper Left (Q2)</span>
          </div>

          <div className="pdc__arch pdc__arch--upper">
            {renderArch(UPPER, true)}
          </div>

          <div className="pdc__occlusal" />

          <div className="pdc__arch pdc__arch--lower">
            {renderArch(LOWER, false)}
          </div>

          <div className="pdc__qlabels pdc__qlabels--bottom">
            <span>Lower Right (Q4)</span>
            <span>Lower Left (Q3)</span>
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="pdc__hint">
        {caseCount === 0
          ? 'No cases recorded for this patient.'
          : `${caseCount} case${caseCount > 1 ? 's' : ''} recorded. Click a highlighted tooth to jump to its case card.`}
      </p>

      {/* Fixed tooltip — rendered outside scroll so it's never clipped */}
      {tooltip && (
        <div
          className="pdc-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
          aria-hidden="true"
        >
          <span className="pdc-tooltip__tooth">Tooth {tooltip.number}</span>
          <span className="pdc-tooltip__diag">{tooltip.diagnosisLabel}</span>
          <span className={`pdc-tooltip__status pdc-tooltip__status--${(tooltip.status || '').toLowerCase()}`}>
            {tooltip.status}
          </span>
        </div>
      )}
    </div>
  );
}
