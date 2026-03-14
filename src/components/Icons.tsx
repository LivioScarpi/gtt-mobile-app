import React from 'react';
import Svg, { Path, Circle, Rect, G, Defs, ClipPath, Ellipse } from 'react-native-svg';
import { Colors } from '../constants/theme';

interface IconProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

export function HomeIcon({ size = 24, color = Colors.textSecondary, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {filled ? (
        <Path
          d="M3 10.5L12 3L21 10.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V10.5Z"
          fill={color}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <Path
          d="M3 10.5L12 3L21 10.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V10.5Z"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      <Path
        d="M9 22V12H15V22"
        stroke={filled ? '#FFFFFF' : color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CalendarIcon({ size = 24, color = Colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MessageIcon({ size = 24, color = Colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ProfileIcon({ size = 24, color = Colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BellIcon({ size = 24, color = Colors.textPrimary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PlusIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5V19M5 12H19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MapPinIcon({ size = 24, color = Colors.textPrimary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SparkleIcon({ size = 24, color = Colors.textPrimary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TicketIcon({ size = 24, color = Colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 9V5C2 4.44772 2.44772 4 3 4H21C21.5523 4 22 4.44772 22 5V9C20.8954 9 20 9.89543 20 11C20 12.1046 20.8954 13 22 13V19C22 19.5523 21.5523 20 21 20H3C2.44772 20 2 19.5523 2 19V13C3.10457 13 4 12.1046 4 11C4 9.89543 3.10457 9 2 9Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 4V20"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="4 4"
      />
    </Svg>
  );
}

export function ArrowLeftIcon({ size = 24, color = Colors.textPrimary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M5 12L12 19M5 12L12 5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronDownIcon({ size = 24, color = Colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9L12 15L18 9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 18, color = '#4A5660' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 18, color = '#4A5660' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18L15 12L9 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function RadioIcon({ size = 24, selected = false }: IconProps & { selected?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={selected ? Colors.primary : '#C4C4C4'} strokeWidth={2} />
      {selected && <Circle cx={12} cy={12} r={6} fill={Colors.primary} />}
    </Svg>
  );
}

export function StethoscopeIcon({ size = 28 }: IconProps) {
  const scale = size / 25;
  const w = 28 * scale;
  const h = 25 * scale;
  return (
    <Svg width={w} height={h} viewBox="0 0 28 25" fill="none">
      <Path
        d="M20.8883 1.42014C20.6814 0.918275 20.0319 0.116239 19.0893 0.923007C17.911 1.93147 21.0306 2.55013 20.8883 1.42014Z"
        fill="#859F9F"
      />
      <Path
        d="M25.8811 3.4398C25.6072 3.85694 25.3575 4.69082 26.5505 4.68922C28.0417 4.68722 26.4778 2.57845 25.8811 3.4398Z"
        fill="#859F9F"
      />
      <Path
        d="M2.01589 20.1714C1.89849 21.6136 3.18361 22.3357 3.84084 22.5165C4.36092 22.6167 5.2222 22.6274 5.71082 22.2025C5.95006 21.9945 6.09996 21.6821 6.07675 21.2246C6.00612 19.8328 4.87271 19.2381 4.31483 19.1146C3.66357 18.8889 2.39688 18.7555 2.08105 19.8117C2.04898 19.919 2.02671 20.0385 2.01589 20.1714Z"
        fill="#BCD0D0"
      />
      <Path
        d="M3.84084 22.5165C3.18361 22.3357 1.89849 21.6136 2.01589 20.1714C2.02671 20.0385 2.04898 19.919 2.08105 19.8117C1.42977 19.9324 0.236593 20.5349 0.674058 21.9795C1.22089 23.7853 3.93756 24.7577 4.85773 24.1963C5.59387 23.7471 5.73318 22.6799 5.71082 22.2025C5.2222 22.6274 4.36092 22.6167 3.84084 22.5165Z"
        fill="#BCD3D3"
      />
      <Path
        d="M26.3851 3.94333C26.338 3.7673 26.1855 3.55923 25.8811 3.4398M14.1303 12.2651C13.6269 11.8752 12.8817 10.8489 13.9275 9.86334C15.2348 8.63137 20.8849 5.03925 23.4618 3.84495C24.6812 3.27982 25.4404 3.26689 25.8811 3.4398M14.1303 12.2651C14.6728 12.6446 16.1367 13.1255 17.6527 12.014C19.5476 10.6246 24.0663 4.69053 23.0924 2.93622C22.5916 2.03417 21.6827 1.60226 20.8883 1.42014M14.1303 12.2651C13.6936 12.5689 13.2098 12.9297 12.7103 13.3327M19.7597 1.31011C20.0406 1.29485 20.4468 1.3189 20.8883 1.42014M12.7103 13.3327C9.72856 15.7382 6.18778 19.6459 8.77342 21.8875C11.7922 24.5046 14.8656 22.0605 16.0249 20.5113C16.8321 18.7588 17.2992 14.8695 12.7103 13.3327ZM12.7103 13.3327C10.4974 12.3531 5.72027 12.1381 4.31483 19.1146M4.31483 19.1146C4.87271 19.2381 6.00612 19.8328 6.07675 21.2246C6.09996 21.6821 5.95006 21.9945 5.71082 22.2025M4.31483 19.1146C3.66357 18.8889 2.39688 18.7555 2.08105 19.8117M2.08105 19.8117C2.04898 19.919 2.02671 20.0385 2.01589 20.1714C1.89849 21.6136 3.18361 22.3357 3.84084 22.5165C4.36093 22.6167 5.2222 22.6274 5.71082 22.2025M2.08105 19.8117C1.42977 19.9324 0.236593 20.5349 0.674058 21.9795C1.22089 23.7853 3.93756 24.7577 4.85773 24.1963C5.59387 23.7471 5.73318 22.6799 5.71082 22.2025M20.8883 1.42014C20.6814 0.918274 20.0319 0.116239 19.0893 0.923007C17.911 1.93147 21.0306 2.55013 20.8883 1.42014ZM25.8811 3.4398C25.6072 3.85694 25.3575 4.69082 26.5505 4.68922C28.0417 4.68722 26.4778 2.57845 25.8811 3.4398Z"
        stroke="#859F9F"
        strokeWidth={1.16013}
      />
    </Svg>
  );
}

export function MastercardIcon({ size = 24 }: IconProps) {
  const h = Math.round(size * 0.75);
  return (
    <Svg width={size} height={h} viewBox="0 0 32 20" fill="none">
      <Circle cx={10} cy={10} r={10} fill="#EB001B" />
      <Circle cx={22} cy={10} r={10} fill="#F79E1B" />
      <Path
        d="M16 2.5C18.15 4.2 19.5 6.9 19.5 10C19.5 13.1 18.15 15.8 16 17.5C13.85 15.8 12.5 13.1 12.5 10C12.5 6.9 13.85 4.2 16 2.5Z"
        fill="#FF5F00"
      />
    </Svg>
  );
}

export function GooglePayIcon({ size = 24 }: IconProps) {
  const w = Math.round(size * 1.6);
  return (
    <Svg width={w} height={size} viewBox="0 0 40 24" fill="none">
      <Rect x={0.5} y={0.5} width={39} height={23} rx={3.5} stroke="#DADCE0" fill="#FFFFFF" />
      <Path d="M19.28 12.2V15.04H18.3V7.97H20.82C21.45 7.97 21.99 8.19 22.43 8.63C22.88 9.07 23.1 9.6 23.1 10.2C23.1 10.82 22.88 11.35 22.43 11.78C21.99 12.2 21.45 12.41 20.82 12.41L19.28 12.2ZM19.28 8.89V11.5H20.84C21.22 11.5 21.54 11.36 21.8 11.08C22.06 10.8 22.19 10.48 22.19 10.2C22.19 9.91 22.06 9.59 21.8 9.32C21.54 9.05 21.22 8.89 20.84 8.89H19.28Z" fill="#4285F4" />
      <Path d="M25.62 10.24C26.37 10.24 26.96 10.46 27.39 10.89C27.82 11.33 28.03 11.9 28.03 12.6V15.04H27.1V14.33H27.07C26.65 14.91 26.1 15.2 25.42 15.2C24.85 15.2 24.37 15.03 23.99 14.7C23.61 14.37 23.42 13.95 23.42 13.46C23.42 12.94 23.62 12.53 24.03 12.23C24.43 11.92 24.98 11.77 25.66 11.77C26.25 11.77 26.72 11.88 27.08 12.09V11.85C27.08 11.51 26.94 11.23 26.67 10.99C26.4 10.76 26.09 10.64 25.74 10.64C25.2 10.64 24.78 10.87 24.48 11.34L23.62 10.82C24.08 10.43 24.77 10.24 25.62 10.24ZM24.37 13.48C24.37 13.73 24.48 13.93 24.7 14.09C24.92 14.26 25.17 14.34 25.46 14.34C25.88 14.34 26.25 14.18 26.58 13.87C26.91 13.56 27.08 13.2 27.08 12.8C26.79 12.56 26.38 12.44 25.84 12.44C25.44 12.44 25.11 12.53 24.85 12.72C24.53 12.91 24.37 13.17 24.37 13.48Z" fill="#4285F4" />
      <Path d="M31.75 10.39L28.78 17H27.8L28.91 14.66L27.1 10.39H28.12L29.38 13.56H29.4L30.73 10.39H31.75Z" fill="#4285F4" />
      <Path d="M16.15 11.39C16.15 11.04 16.12 10.71 16.06 10.39H12.44V12.22H14.54C14.45 12.78 14.15 13.26 13.69 13.58V14.7H14.96C15.71 14.01 16.15 12.79 16.15 11.39Z" fill="#4285F4" />
      <Path d="M12.44 15.75C13.7 15.75 14.76 15.35 15.51 14.6L14.24 13.48C13.82 13.76 13.28 13.93 12.44 13.93C11.24 13.93 10.22 13.19 9.85 12.18H8.54V13.34C9.29 14.8 10.76 15.75 12.44 15.75Z" fill="#34A853" />
      <Path d="M9.85 12.18C9.73 11.82 9.66 11.44 9.66 11.04C9.66 10.64 9.73 10.26 9.85 9.9V8.74H8.54C8.11 9.59 7.87 10.54 7.87 11.55C7.87 12.57 8.11 13.52 8.54 14.37L9.85 12.18Z" fill="#FBBC05" />
      <Path d="M12.44 8.15C13.25 8.15 13.98 8.43 14.55 8.97L15.54 7.98C14.75 7.24 13.7 6.83 12.44 6.83C10.76 6.83 9.29 7.78 8.54 9.24L9.85 10.4C10.22 9.39 11.24 8.15 12.44 8.15Z" fill="#EA4335" />
    </Svg>
  );
}

export function ApplePayIcon({ size = 24 }: IconProps) {
  const w = Math.round(size * 1.6);
  return (
    <Svg width={w} height={size} viewBox="0 0 40 24" fill="none">
      <Rect x={0.5} y={0.5} width={39} height={23} rx={3.5} stroke="#DADCE0" fill="#FFFFFF" />
      <Path d="M12.43 8.75C12.7 8.44 12.88 8.02 12.84 7.59C12.47 7.61 12.01 7.84 11.73 8.15C11.48 8.43 11.26 8.86 11.31 9.27C11.72 9.3 12.14 9.06 12.43 8.75Z" fill="#000000" />
      <Path d="M12.83 9.36C12.22 9.33 11.7 9.7 11.41 9.7C11.12 9.7 10.67 9.38 10.18 9.39C9.55 9.4 8.97 9.74 8.65 10.28C7.99 11.36 8.48 12.96 9.11 13.84C9.42 14.27 9.79 14.75 10.28 14.73C10.75 14.71 10.94 14.43 11.5 14.43C12.06 14.43 12.23 14.73 12.72 14.72C13.23 14.71 13.54 14.29 13.85 13.85C14.21 13.36 14.35 12.88 14.36 12.86C14.35 12.85 13.47 12.51 13.46 11.5C13.45 10.65 14.14 10.25 14.17 10.23C13.78 9.65 13.18 9.39 12.83 9.36Z" fill="#000000" />
      <Path d="M17.6 8.05V14.69H18.7V12.27H20.21C21.59 12.27 22.56 11.32 22.56 10.16C22.56 9 21.6 8.05 20.24 8.05H17.6ZM18.7 9H19.96C20.93 9 21.44 9.47 21.44 10.16C21.44 10.85 20.93 11.32 19.95 11.32H18.7V9Z" fill="#000000" />
      <Path d="M24.95 14.75C25.6 14.75 26.2 14.44 26.49 13.93H26.51V14.69H27.53V11.73C27.53 10.77 26.78 10.15 25.63 10.15C24.56 10.15 23.76 10.77 23.73 11.6H24.72C24.83 11.23 25.2 10.98 25.72 10.98C26.36 10.98 26.61 11.3 26.61 11.8V12.2L25.33 12.28C24.14 12.36 23.5 12.84 23.5 13.58C23.5 14.33 24.14 14.75 24.95 14.75ZM25.24 13.99C24.69 13.99 24.37 13.74 24.37 13.36C24.37 12.97 24.69 12.73 25.27 12.69L26.61 12.6V12.97C26.61 13.55 26.1 13.99 25.24 13.99Z" fill="#000000" />
      <Path d="M29.64 16.5C30.67 16.5 31.14 16.1 31.55 14.89L33.34 10.21H32.27L31.06 13.78H31.04L29.83 10.21H28.73L30.42 14.65L30.33 14.97C30.17 15.49 29.89 15.69 29.42 15.69C29.34 15.69 29.18 15.68 29.12 15.67V16.47C29.18 16.49 29.5 16.5 29.64 16.5Z" fill="#000000" />
    </Svg>
  );
}

export function PayPalIcon({ size = 24 }: IconProps) {
  const w = Math.round(size * 1.6);
  return (
    <Svg width={w} height={size} viewBox="0 0 40 24" fill="none">
      <Rect x={0.5} y={0.5} width={39} height={23} rx={3.5} stroke="#DADCE0" fill="#FFFFFF" />
      <Path d="M16.44 7.37H12.63C12.4 7.37 12.2 7.54 12.17 7.77L10.78 16.43C10.76 16.6 10.89 16.75 11.06 16.75H12.88C13.11 16.75 13.31 16.58 13.34 16.35L13.73 13.88C13.76 13.65 13.96 13.48 14.19 13.48H15.28C17.56 13.48 18.87 12.37 19.22 10.19C19.38 9.24 19.23 8.49 18.77 7.95C18.27 7.36 17.47 7.37 16.44 7.37ZM16.86 10.32C16.67 11.55 15.73 11.55 14.83 11.55H14.32L14.69 9.19C14.71 9.05 14.84 8.95 14.98 8.95H15.2C15.83 8.95 16.42 8.95 16.73 9.31C16.91 9.52 16.97 9.84 16.86 10.32Z" fill="#253B80" />
      <Path d="M25.07 10.28H23.24C23.1 10.28 22.97 10.38 22.95 10.52L22.87 11.02L22.74 10.83C22.33 10.24 21.41 10.04 20.49 10.04C18.35 10.04 16.53 11.65 16.19 13.87C16.01 14.98 16.27 16.04 16.88 16.78C17.44 17.46 18.24 17.74 19.17 17.74C20.72 17.74 21.58 16.75 21.58 16.75L21.49 17.25C21.47 17.42 21.6 17.57 21.77 17.57H23.41C23.64 17.57 23.84 17.4 23.87 17.17L24.86 10.6C24.88 10.43 24.75 10.28 24.58 10.28H25.07ZM22.06 13.93C21.88 15.01 21.02 15.74 19.93 15.74C19.38 15.74 18.95 15.56 18.67 15.23C18.39 14.9 18.29 14.44 18.38 13.92C18.55 12.85 19.42 12.1 20.49 12.1C21.03 12.1 21.46 12.29 21.74 12.62C22.03 12.96 22.14 13.42 22.06 13.93Z" fill="#179BD7" />
      <Path d="M27.36 7.68L25.94 16.43C25.92 16.6 26.05 16.75 26.22 16.75H27.81C28.04 16.75 28.24 16.58 28.27 16.35L29.66 7.69C29.68 7.52 29.55 7.37 29.38 7.37H27.64C27.5 7.37 27.38 7.47 27.36 7.68Z" fill="#179BD7" />
    </Svg>
  );
}

export function CheckIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 14L8.5 17.5L19 6.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TrashIcon({ size = 24, color = '#FF4444' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6H5H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M10 11V17" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M14 11V17" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function CreditCardIcon({ size = 24, color = Colors.textPrimary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={4} width={20} height={16} rx={3} stroke={color} strokeWidth={1.5} />
      <Path d="M2 10H22" stroke={color} strokeWidth={1.5} />
      <Path d="M6 15H10" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function BusIcon({ size = 24, color = Colors.textSecondary, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {filled ? (
        <>
          <Path
            d="M4 16V6C4 4.34315 5.34315 3 7 3H17C18.6569 3 20 4.34315 20 6V16C20 17.1046 19.1046 18 18 18H6C4.89543 18 4 17.1046 4 16Z"
            fill={color}
            stroke={color}
            strokeWidth={1.8}
          />
          <Path d="M4 10H20" stroke="#fff" strokeWidth={1.8} />
          <Circle cx={7.5} cy={14.5} r={1.5} fill="#fff" />
          <Circle cx={16.5} cy={14.5} r={1.5} fill="#fff" />
          <Path d="M7 18V20M17 18V20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </>
      ) : (
        <>
          <Path
            d="M4 16V6C4 4.34315 5.34315 3 7 3H17C18.6569 3 20 4.34315 20 6V16C20 17.1046 19.1046 18 18 18H6C4.89543 18 4 17.1046 4 16Z"
            stroke={color}
            strokeWidth={1.8}
          />
          <Path d="M4 10H20" stroke={color} strokeWidth={1.8} />
          <Circle cx={7.5} cy={14.5} r={1.5} stroke={color} strokeWidth={1.5} />
          <Circle cx={16.5} cy={14.5} r={1.5} stroke={color} strokeWidth={1.5} />
          <Path d="M7 18V20M17 18V20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

export function MapIcon({ size = 24, color = Colors.textSecondary, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {filled ? (
        <Path
          d="M1 6V22L8 18L16 22L23 18V2L16 6L8 2L1 6Z"
          fill={color}
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <Path
            d="M1 6V22L8 18L16 22L23 18V2L16 6L8 2L1 6Z"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M8 2V18" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M16 6V22" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </Svg>
  );
}

export function SettingsIcon({ size = 24, color = Colors.textSecondary, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
      <Path
        d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
