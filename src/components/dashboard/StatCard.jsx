import '../../styles/StatCard.css';

export default function StatCard({ label, value, icon, accent = 'blue', trend }) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <div className="stat-card__body">
        <div className="stat-card__info">
          <span className="stat-card__label">{label}</span>
          <span className="stat-card__value">{value}</span>
          {trend && (
            <span className={`stat-card__trend stat-card__trend--${trend.dir}`}>
              {trend.dir === 'up' ? '↑' : '↓'} {trend.text}
            </span>
          )}
        </div>
        <div className="stat-card__icon-wrap">
          {icon}
        </div>
      </div>
    </div>
  );
}
