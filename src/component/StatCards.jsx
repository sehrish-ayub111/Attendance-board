<<<<<<< HEAD
// Simple presentational component that renders a row/grid of summary stat cards.
// Takes a `cards` array (e.g. from AdminDashboard's statCards), where each item
// has { label, value, icon, color }, and renders one card per item.
export default function StatCards({ cards }) {
  return (
    <div className="stat-cards">
      {cards.map((c) => (
        <div key={c.label} className="stat-card">
          {/* Colored icon badge, background color comes from the card's data */}
          <div className="stat-card-icon" style={{ background: c.color }}>
            {c.icon}
          </div>
          {/* Value (the number) + label (description) stacked underneath */}
          <div className="stat-card-info">
=======
export default function StatCards({cards}){
    return(
        <div className="stat-cards">
            {cards.map((c) => (
                <div key={c.label} className="stat-card">
                    <div className="stat-card-icon" style={{background: c.color}}>
                        {c.icon}
                    </div>
                          <div className="stat-card-info">
>>>>>>> old-hrm-project
            <span className="stat-card-value">{c.value}</span>
            <span className="stat-card-label">{c.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}