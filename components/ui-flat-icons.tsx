"use client";

import type { ReactNode } from "react";

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
};

function SvgIcon({
  size = 18,
  color = "currentColor",
  strokeWidth = 1.8,
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3.5L13.7 8.3L18.5 10L13.7 11.7L12 16.5L10.3 11.7L5.5 10L10.3 8.3L12 3.5Z" />
    </SvgIcon>
  );
}

export function BrainIcon(props: IconProps) {
  return (
    <SvgIcon {...props} strokeWidth={1.6}>
      <path d="M9.2 5.2C8 4 6 4.1 4.9 5.4C3.8 6.6 4 8.6 5.2 9.7C4 10.7 3.7 12.5 4.5 13.9C5.2 15.3 6.8 16 8.3 15.7C8.2 17.4 9.4 19 11.1 19.3C12.8 19.6 14.4 18.6 15 17.1C16.3 18.1 18.3 18 19.4 16.8C20.6 15.5 20.4 13.5 19.1 12.4C20.4 11.4 20.7 9.5 19.9 8.1C19.2 6.7 17.5 6 16 6.4C16.1 4.7 14.9 3.1 13.2 2.8C11.5 2.5 9.9 3.5 9.2 5.2Z" />
      <path d="M10 8.3C10.8 9 11.3 10 11.3 11.1V19" />
      <path d="M14 7.8C13.2 8.5 12.7 9.5 12.7 10.6V19" />
    </SvgIcon>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5V5" />
      <path d="M12 19V21.5" />
      <path d="M2.5 12H5" />
      <path d="M19 12H21.5" />
    </SvgIcon>
  );
}

export function PathIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 17C6.5 14 8.5 14 10.5 16C12.5 18 14.5 18 17 14" />
      <path d="M17 14L16 10.5" />
      <path d="M17 14L20.5 13" />
      <circle cx="6" cy="17" r="1.2" />
      <circle cx="12" cy="16" r="1.2" />
      <circle cx="18" cy="14" r="1.2" />
    </SvgIcon>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.7 12.2L10.8 14.3L15.4 9.7" />
    </SvgIcon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12L15.2 13.8" />
    </SvgIcon>
  );
}

export function PlayCircleIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M10 9L15 12L10 15V9Z" />
    </SvgIcon>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M5 18V10" />
      <path d="M10 18V6" />
      <path d="M15 18V13" />
      <path d="M20 18V8" />
      <path d="M3.5 18H21" />
    </SvgIcon>
  );
}

export function LayerIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 4L20 8L12 12L4 8L12 4Z" />
      <path d="M6.5 11L12 14L17.5 11" />
      <path d="M6.5 14L12 17L17.5 14" />
    </SvgIcon>
  );
}

export function SessionIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="4" y="5" width="16" height="12" rx="3" />
      <path d="M8 9H16" />
      <path d="M8 13H13" />
    </SvgIcon>
  );
}

export function ActionListIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M8 7H18" />
      <path d="M8 12H18" />
      <path d="M8 17H18" />
      <circle cx="5" cy="7" r="1" fill={props.color || "currentColor"} stroke="none" />
      <circle cx="5" cy="12" r="1" fill={props.color || "currentColor"} stroke="none" />
      <circle cx="5" cy="17" r="1" fill={props.color || "currentColor"} stroke="none" />
    </SvgIcon>
  );
}

export function UserCardIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="9" r="3" />
      <path d="M6.5 18C7.6 15.7 9.6 14.5 12 14.5C14.4 14.5 16.4 15.7 17.5 18" />
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    </SvgIcon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M5 12H18" />
      <path d="M14.5 8.5L18 12L14.5 15.5" />
    </SvgIcon>
  );
}

export function BadgePill({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span
      className="badge"
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      {icon}
      {children}
    </span>
  );
}