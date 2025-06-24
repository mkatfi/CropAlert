// Type declarations for react-leaflet v5.x compatibility
declare module 'react-leaflet' {
  import { ReactNode } from 'react';
  import * as L from 'leaflet';

  export interface MapContainerProps {
    center: [number, number];
    zoom: number;
    style?: React.CSSProperties;
    children?: ReactNode;
  }

  export interface TileLayerProps {
    url: string;
    attribution?: string;
  }

  export interface MarkerProps {
    position: [number, number];
    icon?: L.Icon;
    eventHandlers?: {
      click?: () => void;
    };
    children?: ReactNode;
  }

  export interface PopupProps {
    maxWidth?: number;
    className?: string;
    children?: ReactNode;
  }

  export const MapContainer: React.FC<MapContainerProps>;
  export const TileLayer: React.FC<TileLayerProps>;
  export const Marker: React.FC<MarkerProps>;
  export const Popup: React.FC<PopupProps>;
  export const useMap: () => L.Map;
  export const useMapEvents: (handlers: any) => void;
}
