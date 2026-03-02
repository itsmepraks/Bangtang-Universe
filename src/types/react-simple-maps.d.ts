declare module 'react-simple-maps' {
  import type { FC, ReactNode, MouseEventHandler } from 'react';

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: { scale?: number; center?: [number, number] };
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    children?: ReactNode;
  }

  export interface ZoomableGroupProps {
    zoom?: number;
    center?: [number, number];
    minZoom?: number;
    maxZoom?: number;
    onMoveEnd?: (position: { zoom: number; coordinates: [number, number] }) => void;
    children?: ReactNode;
  }

  export interface GeographiesProps {
    geography: object;
    children: (props: { geographies: Geography[] }) => ReactNode;
  }

  export interface Geography {
    rsmKey: string;
    properties?: Record<string, unknown>;
    [key: string]: unknown;
  }

  export interface GeographyProps {
    geography: Geography;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: Record<string, unknown>;
    children?: ReactNode;
  }

  export interface MarkerProps {
    coordinates: [number, number];
    onMouseEnter?: MouseEventHandler<SVGElement>;
    onMouseLeave?: () => void;
    children?: ReactNode;
  }

  export const ComposableMap: FC<ComposableMapProps>;
  export const ZoomableGroup: FC<ZoomableGroupProps>;
  export const Geographies: FC<GeographiesProps>;
  export const Geography: FC<GeographyProps>;
  export const Marker: FC<MarkerProps>;
}
