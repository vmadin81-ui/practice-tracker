import L from 'leaflet'

function makeColoredIcon(color: string) {
  return L.divIcon({
    className: 'custom-status-marker',
    html: `<div class="marker-dot marker-${color}"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  })
}

export const greenMarkerIcon = makeColoredIcon('green')
export const yellowMarkerIcon = makeColoredIcon('yellow')
export const redMarkerIcon = makeColoredIcon('red')
export const grayMarkerIcon = makeColoredIcon('gray')

export function getMarkerIcon(status: string) {
  switch (status) {
    case 'green':
      return greenMarkerIcon
    case 'yellow':
      return yellowMarkerIcon
    case 'red':
      return redMarkerIcon
    default:
      return grayMarkerIcon
  }
}