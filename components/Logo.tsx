import Image from "next/image";

type LogoProps = {
  className?: string;
  light?: boolean;
};

export default function Logo({ className = "", light = false }: LogoProps) {
  const img = (
    <Image
      src="/logo.png"
      alt="First Choice Pharmacy"
      width={220}
      height={70}
      priority
      className="h-10 w-auto object-contain sm:h-11"
    />
  );

  if (light) {
    return (
      <div className={`inline-flex items-center rounded-2xl bg-white/95 px-3 py-1.5 ${className}`}>
        {img}
      </div>
    );
  }

  return <div className={`flex items-center ${className}`}>{img}</div>;
}
