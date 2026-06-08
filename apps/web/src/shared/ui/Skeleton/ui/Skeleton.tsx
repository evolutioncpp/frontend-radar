import clsx from 'clsx';

import s from './Skeleton.module.scss';

import type { HTMLAttributes } from 'react';

interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export const Skeleton = ({
  width,
  height,
  borderRadius,
  className,
  style,
  ...props
}: SkeletonProps) => {
  return (
    <div
      aria-hidden="true"
      className={clsx(s.skeleton, className)}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      {...props}
    />
  );
};
