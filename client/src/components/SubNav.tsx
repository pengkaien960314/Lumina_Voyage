import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

interface SubNavProps {
  items: { path: string; label: string; icon: React.ReactNode }[];
}

export default function SubNav({ items }: SubNavProps) {
  const [location] = useLocation();

  return (
    <div className="flex gap-1 p-1.5 liquid-glass rounded-2xl w-fit">
      {items.map((item) => {
        const isActive = location === item.path;
        return (
          <Link key={item.path} href={item.path}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </motion.button>
          </Link>
        );
      })}
    </div>
  );
}
