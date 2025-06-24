/// <reference types="react-scripts" />

declare module 'leaflet' {
  interface Icon {
    _getIconUrl?: string;
  }
}
