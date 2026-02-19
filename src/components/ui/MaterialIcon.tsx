import { cn } from '@/lib/utils';

interface MaterialIconProps {
  name: string;
  filled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'text-[18px]',
  md: 'text-[24px]',
  lg: 'text-[32px]',
  xl: 'text-[48px]',
};

export function MaterialIcon({
  name,
  filled = false,
  className,
  size = 'md'
}: MaterialIconProps) {
  return (
    <span
      className={cn(
        'material-symbols-outlined',
        filled && 'filled',
        sizeClasses[size],
        className
      )}
    >
      {name}
    </span>
  );
}
