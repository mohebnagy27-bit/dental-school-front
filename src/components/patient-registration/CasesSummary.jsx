import FormSection from './FormSection';

function SummaryRow({ caseItem, index, onEdit, onDelete }) {
  const teeth = caseItem.type === 'diagnosis'
    ? caseItem.teeth.slice().sort((a, b) => a - b).join(', ')
    : caseItem.treatmentTeeth?.length > 0
      ? caseItem.treatmentTeeth.slice().sort((a, b) => a - b).join(', ')
      : '—';
  const diagnosis = caseItem.type === 'diagnosis' ? caseItem.diagnosisLabel : '—';
  const treatment = caseItem.type === 'treatment' ? caseItem.treatmentLabel : '—';
  const badgeClass = caseItem.type === 'diagnosis' ? `sum-badge sum-badge--${caseItem.diagnosisCategory}` : 'sum-badge sum-badge--treatment';
  const rowClass = caseItem.type === 'diagnosis' ? `sum-table__row sum-table__row--${caseItem.diagnosisCategory}` : 'sum-table__row sum-table__row--treatment';

  return (
    <tr className={rowClass}>
      <td className="sum-table__cell sum-table__cell--num">{index + 1}</td>
      <td className="sum-table__cell">{teeth}</td>
      <td className="sum-table__cell">{diagnosis !== '—' ? <span className={badgeClass}>{diagnosis}</span> : <span className="sum-table__dash">—</span>}</td>
      <td className="sum-table__cell">{treatment !== '—' ? <span className={badgeClass}>{treatment}</span> : <span className="sum-table__dash">—</span>}</td>
      <td className="sum-table__cell"><span className="sum-table__dash">—</span></td>
      <td className="sum-table__cell sum-table__cell--actions">
        <button type="button" className="sum-action sum-action--edit" onClick={() => onEdit(caseItem.id)} title="Edit this case">Edit</button>
        <button type="button" className="sum-action sum-action--delete" onClick={() => onDelete(caseItem.id)} title="Delete this case">Delete</button>
      </td>
    </tr>
  );
}

export default function CasesSummary({ cases, options, onEdit, onDelete }) {
  return (
    <FormSection title="Cases Summary" badge={cases.length > 0 ? `${cases.length} ${cases.length === 1 ? 'entry' : 'entries'}` : undefined} className="reg-section--summary">
      <div className="sum-legend">
        <span className="sum-legend__item sum-legend__item--caries">Caries</span>
        <span className="sum-legend__item sum-legend__item--extraction">Extraction</span>
        <span className="sum-legend__item sum-legend__item--remaining_root">Remaining Root</span>
        <span className="sum-legend__item sum-legend__item--treatment">Treatment</span>
      </div>
      {cases.length === 0 ? (
        <div className="sum-empty">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="8" y="10" width="24" height="22" rx="3" stroke="#CBD5E1" strokeWidth="1.5" /><path d="M13 18h14M13 22h10" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" /><path d="M25 6v8M15 6v8" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <p>No cases added yet. Select teeth and assign a diagnosis above.</p>
        </div>
      ) : (
        <div className="sum-table-wrap">
          <table className="sum-table">
            <thead><tr className="sum-table__head"><th className="sum-table__th">#</th><th className="sum-table__th">Tooth Number</th><th className="sum-table__th">Diagnosis</th><th className="sum-table__th">Treatment Type</th><th className="sum-table__th">Additional Details</th><th className="sum-table__th">Actions</th></tr></thead>
            <tbody>{cases.map((caseItem, index) => <SummaryRow key={caseItem.id} caseItem={caseItem} index={index} onEdit={onEdit} onDelete={onDelete} />)}</tbody>
          </table>
        </div>
      )}
      {(options.completeDenture || options.singleDenture) && (
        <div className="sum-additional">
          <p className="sum-additional__title">Additional Prosthetic Options</p>
          <div className="sum-additional__list">
            {options.completeDenture && <div className="sum-additional__item"><span className="sum-badge sum-badge--treatment">Complete Denture</span></div>}
            {options.singleDenture && <div className="sum-additional__item"><span className="sum-badge sum-badge--treatment">Single Denture</span>{options.singleArch && <span className="sum-additional__detail">{options.singleArch}</span>}</div>}
          </div>
        </div>
      )}
    </FormSection>
  );
}
