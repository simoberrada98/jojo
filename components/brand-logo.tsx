'use client';

/**
 * Lightweight brand logo component providing the inline SVG across the app.
 */

import type { SVGProps } from 'react';

import { cn } from '@/lib/utils';

interface BrandLogoProps extends SVGProps<SVGSVGElement> {
  description?: string;
  decorative?: boolean;
  title?: string;
}

export function BrandLogo({
  className,
  description = 'Premium cryptocurrency mining hardware solutions logo',
  decorative = true,
  title = 'Jhuangnyc',
  ...props
}: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 2048 648"
      className={cn(
        'w-32 sm:w-auto sm:max-w-48 h-auto text-foreground',
        className
      )}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
      {...props}
    >
      {!decorative && <title>{title}</title>}
      {!decorative && description ? <desc>{description}</desc> : null}
      <path
        d="M230.96 550.927c-30.878-3.59-58.595-14.904-84.932-34.664-25.37-19.035-47.864-50.54-57.532-80.581-6.798-21.125-7.363-27.88-8.142-97.379l-.76-67.724h15.204c12.385 0 15.383.47 16.176 2.536.535 1.394.973 30.833.973 65.418 0 58.07.252 63.857 3.27 75.608 14.506 56.44 62.606 98.697 119.063 104.599 42.051 4.396 80.297-8.722 110.533-37.912 18.91-18.258 30.476-38.598 37.405-65.79l3.831-15.032V129.52H240.182v108.914l30.856 30.359 30.857 30.359.43-39.427.428-39.427-4.657-4.915c-10.524-11.104-12.78-24.827-6.22-37.836 2.897-5.745 5.442-8.07 12.93-11.811 8.772-4.385 9.797-4.55 17.399-2.795 4.443 1.026 10.182 3.363 12.755 5.195 13.96 9.941 14.822 36.605 1.568 48.592-3.354 3.034-3.376 3.616-3.4 91.367-.034 97.43-.248 100.056-9.992 118.62-6.545 12.471-23.302 29.253-35.668 35.723-25.183 13.175-57.767 13.798-84.154 1.607-21.268-9.826-39.785-31.935-45.906-54.813-1.376-5.145-2.15-17.517-2.163-34.555l-.035-26.54-7.31-5.153c-9.153-6.452-12.522-13.897-11.557-25.54 1.2-14.452 11.643-24.425 25.58-24.425 14.936 0 25.532 9.012 27.883 23.715.99 6.188 3.604 9.164 32.13 36.571l31.053 29.836v28.674c0 17.303.612 28.675 1.543 28.675 5.243 0 20.344-7.667 27.145-13.782 15.631-14.053 19.28-24.151 20.527-56.81l.89-23.306-47.45-46.423-47.45-46.421.358-78.544.356-78.544 104.637-.413 104.637-.412-.468 157.5-.468 157.5-3.696 12.762c-15.262 52.708-43.598 88.233-88.688 111.19-28.79 14.657-60.224 20.06-93.919 16.14zm-8.05-133.684c-.214-16.023-.707-19.444-3.113-21.61-1.572-1.417-9.974-9.396-18.67-17.73l-15.814-15.155.81 17.632c.971 21.11 3.796 29.938 12.881 40.26 6.883 7.819 19.832 17.08 22.594 16.16.922-.31 1.462-8.347 1.312-19.557z"
        fill="currentColor"
      />
      <text
        xmlSpace="preserve"
        x={1773.98}
        y={1258.412}
        strokeWidth={1.006}
        fontFamily="JetBrains Mono"
        fontSize={85.736}
        fontWeight={600}
        textAnchor="middle"
        transform="matrix(3.20652 0 0 3.16978 -4446.43 -3664.114)"
        fill="currentColor"
        className="uppercase"
      >
        <tspan x={1773.98} y={1258.412} fontWeight={700}>
          Jhuangnyc
        </tspan>
      </text>
      <text
        xmlSpace="preserve"
        fontFamily="Inter"
        fontSize={30.112}
        fontWeight={400}
        transform="translate(-4510.182 -3808.352) scale(3.1881)"
        fill="currentColor"
      >
        <tspan x={1570.937} y={1344.701}>
          <tspan fontFamily="Inter" fontWeight={600}>
            Premium Crypto Mining Hardware
          </tspan>
        </tspan>
      </text>
    </svg>
  );
}
