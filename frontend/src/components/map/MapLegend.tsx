export function MapLegend() {
  return (
    <div className="map-legend">
      <div><span className="legend-dot marker-green" /> Green — на месте</div>
      <div><span className="legend-dot marker-yellow" /> Yellow — требует проверки</div>
      <div><span className="legend-dot marker-red" /> Red — вне зоны / нет подтверждения</div>
      <div><span className="legend-dot marker-gray" /> Gray — нет практики / нет данных</div>
    </div>
  )
}