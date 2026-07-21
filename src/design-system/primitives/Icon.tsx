import type { SVGProps } from 'react'

/**
 * The app's icon set — replaces emoji everywhere (cross-platform emoji fonts
 * render inconsistently and off-brand). Stroke-based, 24x24, currentColor —
 * size via text size or explicit className (e.g. "h-8 w-8"), color via text
 * color utilities (text-navy, text-orange, …).
 */
export type IconName =
  | 'shield'
  | 'banknote'
  | 'heart'
  | 'refresh'
  | 'dove'
  | 'stethoscope'
  | 'heartPulse'
  | 'bandage'
  | 'brain'
  | 'wallet'
  | 'pause'
  | 'document'
  | 'folder'
  | 'search'
  | 'eye'
  | 'barChart'
  | 'lightbulb'
  | 'warning'
  | 'infinity'
  | 'trendingUp'

const PATHS: Record<IconName, JSX.Element> = {
  shield: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2.75 4.5 5.75v5.4c0 5 3.2 8.36 7.5 9.6 4.3-1.24 7.5-4.6 7.5-9.6v-5.4L12 2.75Z"
    />
  ),
  banknote: (
    <>
      <rect x="2.75" y="6.25" width="18.5" height="11.5" rx="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9v0M18.5 15v0" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  heart: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 20.25s-7.25-4.44-9.5-9.11C1.02 8.1 2.6 4.75 6 4.25c2-.29 3.6.6 6 3 2.4-2.4 4-3.29 6-3 3.4.5 4.98 3.85 3.5 6.89-2.25 4.67-9.5 9.11-9.5 9.11Z"
    />
  ),
  refresh: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 4.5v5h5M20 19.5v-5h-5M4.5 9A8 8 0 0 1 19 8M19.5 15a8 8 0 0 1-14.5 1"
    />
  ),
  dove: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 5c1.4-1.8 3.6-2.4 5.5-1.5-1 .3-2 1-2.6 2 1.8.2 3.3 1.3 4.1 2.9-1.4-.5-2.7-.4-3.7.2.7 2.6-.4 5.4-2.8 6.9-.6.35-1.2.6-1.9.75L11 21h-2l.7-4.3c-2.7-.3-5-2.2-5.8-4.9 1.4.6 2.7.6 3.8 0-.9-1.7-.7-3.7.5-5.2 1-.35 2 .35 2.4 1.4.35-1 .8-2 1.4-3Z"
    />
  ),
  stethoscope: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 3.5v5.25a4.25 4.25 0 0 0 8.5 0V3.5M5 3.5H3.5M13.5 3.5H15M9.25 13v2.25a5.75 5.75 0 0 0 11.5 0v-1.5M20.75 13.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z"
    />
  ),
  heartPulse: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 20.25s-7.25-4.44-9.5-9.11C1.02 8.1 2.6 4.75 6 4.25c2-.29 3.6.6 6 3 2.4-2.4 4-3.29 6-3 3.4.5 4.98 3.85 3.5 6.89-.35.73-.83 1.44-1.37 2.11M2.75 11.5h3l1.5-3 2 5 1.5-3h2.5"
    />
  ),
  bandage: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m7.5 16.5-4-4a3 3 0 0 1 0-4.25l3-3a3 3 0 0 1 4.25 0l4 4m-7.25 7.25 4-4a3 3 0 0 1 4.25 0l4 4a3 3 0 0 1 0 4.25l-3 3a3 3 0 0 1-4.25 0l-4-4m3.25-3.25 3 3M9.5 9.5l1.75 1.75"
    />
  ),
  brain: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 4.5a2.75 2.75 0 0 0-2.75 2.75c0 .18.01.35.04.52A3 3 0 0 0 4.5 10.5a3 3 0 0 0 1.1 5.79 2.75 2.75 0 0 0 2.65 3.46c.65 0 1.24-.2 1.75-.55M9 4.5c1 0 1.85.4 2.5 1.05M9 4.5v14.7M15 4.5a2.75 2.75 0 0 1 2.75 2.75c0 .18-.01.35-.04.52A3 3 0 0 1 19.5 10.5a3 3 0 0 1-1.1 5.79 2.75 2.75 0 0 1-2.65 3.46c-.65 0-1.24-.2-1.75-.55M15 4.5c-1 0-1.85.4-2.5 1.05M15 4.5v14.7"
    />
  ),
  wallet: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 7.75A2.75 2.75 0 0 1 5.75 5h11.5A2.75 2.75 0 0 1 20 7.75v8.5A2.75 2.75 0 0 1 17.25 19H5.75A2.75 2.75 0 0 1 3 16.25v-8.5Zm0 3.75h14.5a2.5 2.5 0 0 1 2.5 2.5v1a2.5 2.5 0 0 1-2.5 2.5H3M16.25 13.5v0"
    />
  ),
  pause: <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 5.5v13M15.5 5.5v13" />,
  document: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 3.5H7.25A1.75 1.75 0 0 0 5.5 5.25v13.5c0 .97.78 1.75 1.75 1.75h9.5c.97 0 1.75-.78 1.75-1.75V8.5l-5-5Zm0 0V7.5a1 1 0 0 0 1 1h4M8.5 12.5h7M8.5 16h7"
    />
  ),
  folder: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.5 7.25c0-.97.78-1.75 1.75-1.75h4l2 2.25h7.5c.97 0 1.75.78 1.75 1.75v8.75c0 .97-.78 1.75-1.75 1.75H5.25c-.97 0-1.75-.78-1.75-1.75V7.25Z"
    />
  ),
  search: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm10 2-5.4-5.4" />,
  eye: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12S5.5 5.75 12 5.75 21.75 12 21.75 12 18.5 18.25 12 18.25 2.25 12 2.25 12ZM12 14.75a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Z"
    />
  ),
  barChart: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 20V10.5M10 20V4M16 20v-7M22 20H2M4 20v0"
    />
  ),
  lightbulb: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 18.25h6M9.75 21h4.5M12 3a6.25 6.25 0 0 0-3.5 11.42c.6.42.97 1.1.97 1.83v.5h5.06v-.5c0-.73.37-1.41.97-1.83A6.25 6.25 0 0 0 12 3Z"
    />
  ),
  warning: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v4.25M12 16.5v.01M10.4 3.9 2.5 18.2c-.6 1.1.2 2.4 1.4 2.4h16.2c1.2 0 2-1.3 1.4-2.4L13.6 3.9c-.6-1.1-2.2-1.1-2.8 0Z"
    />
  ),
  infinity: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 8.5A3.5 3.5 0 0 0 7 15.5c1.93 0 3.02-1.17 5-3.5 1.98-2.33 3.07-3.5 5-3.5a3.5 3.5 0 1 1 0 7c-1.93 0-3.02-1.17-5-3.5-1.98-2.33-3.07-3.5-5-3.5Z"
    />
  ),
  trendingUp: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5 9.5 10l4 4L21 6.5M21 6.5h-5M21 6.5v5"
    />
  ),
}

export function Icon({
  name,
  className = 'h-6 w-6',
  strokeWidth = 1.6,
  ...rest
}: { name: IconName; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}
