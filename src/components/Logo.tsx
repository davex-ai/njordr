import icon from '@/app/favicon.ico'
import Image from 'next/image'

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 font-semibold tracking-tight text-accent">
       <Image 
        src={icon} 
        alt="Logo" 
        width={size} 
        height={size} 
      />
      <span className="text-xl">Njörðr</span>
    </span>
  );
}
