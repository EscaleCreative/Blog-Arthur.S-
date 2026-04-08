import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "motion/react";
import { Slot } from "@radix-ui/react-slot";

interface MangaCardProps {
  children: React.ReactNode;
  className?: string;
  kanji?: string;
  onClick?: () => void;
}

export function MangaCard({ children, className, kanji, onClick }: MangaCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, x: -4, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={cn(
        "relative bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer overflow-hidden",
        className
      )}
    >
      {kanji && (
        <div className="absolute -top-4 -right-4 text-8xl font-black text-manga-red/10 pointer-events-none select-none italic transform rotate-12">
          {kanji}
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

interface MangaButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  asChild?: boolean;
}

export function MangaButton({ children, className, variant = 'primary', asChild = false, ...props }: MangaButtonProps) {
  const variants = {
    primary: "bg-manga-red text-white border-4 border-black hover:bg-red-700",
    secondary: "bg-white text-black border-4 border-black hover:bg-gray-100",
    outline: "bg-transparent text-black border-4 border-black hover:bg-black hover:text-white",
    danger: "bg-red-600 text-white border-4 border-black hover:bg-red-700"
  };

  if (asChild) {
    // Filter out motion props that Slot can't handle
    const { 
      whileHover, whileTap, whileDrag, whileFocus, whileInView, 
      animate, initial, exit, transition, variants: motionVariants,
      ...rest 
    } = props as any;

    return (
      <Slot
        className={cn(
          "px-8 py-4 font-black uppercase tracking-tighter text-lg transition-all active:shadow-none inline-flex items-center justify-center",
          "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
          variants[variant],
          className
        )}
        {...rest}
      >
        {children}
      </Slot>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95, x: 2, y: 2 }}
      className={cn(
        "px-8 py-4 font-black uppercase tracking-tighter text-lg transition-all active:shadow-none inline-flex items-center justify-center",
        "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
