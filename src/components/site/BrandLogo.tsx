import logoAsset from "@/assets/titans-logo-transparente.png.asset.json";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <img
      src={logoAsset.url}
      alt="Titans Tattoo Studio"
      width={700}
      height={260}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={cn("h-auto w-full object-contain", className)}
    />
  );
}