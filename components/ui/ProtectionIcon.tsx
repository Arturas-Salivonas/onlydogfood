import { cn } from '@/lib/utils/cn';

export interface ProtectionIconProps {
  className?: string;
  alt?: string;
}

export function ProtectionIcon({ className, alt = "Protection" }: ProtectionIconProps) {
  return (
    <img
      src="/protection.png"
      alt={alt}
      className={cn("inline-block", className)}
    />
  );
}
