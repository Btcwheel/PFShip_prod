import Image from "next/image";
import logoSrc from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  withText?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { w: 96, h: 24 },
  md: { w: 140, h: 36 },
  lg: { w: 200, h: 52 },
  xl: { w: 280, h: 72 },
};

export function Logo({ size = "md", className }: LogoProps) {
  const { w, h } = SIZE_MAP[size];
  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src={logoSrc}
        alt="PF Ship — Partners Friends & Ship"
        width={w}
        height={h}
        priority
        className="object-contain dark:brightness-110"
      />
    </div>
  );
}
