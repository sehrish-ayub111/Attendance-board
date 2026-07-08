export default function StatCards({cards}){
    return(
        <div className="stat-cards">
            {cards.map((c) => (
                <div key={c.label} className="stat-card">
                    <div className="stat-card-icon" style={{background: c.color}}>
                        {c.icon}
                    </div>
                          <div className="stat-card-info">
            <span className="stat-card-value">{c.value}</span>
            <span className="stat-card-label">{c.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}