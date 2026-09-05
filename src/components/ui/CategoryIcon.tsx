import React from 'react';
import {
  Laptop,
  Tv,
  Snowflake,
  Fan,
  Smartphone,
  Lightbulb,
  Wind,
  WashingMachine,
  Headphones,
  Ear,
  Package,
  Layers,
  Sparkles,
  Zap,
  Radio,
  Speaker,
  Cpu,
  Tablet,
  Watch,
  Flame,
  Volume2,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  const iconMap: Record<string, React.ComponentType<LucideProps>> = {
    Laptop,
    Tv,
    Snowflake,
    ThermometerSnowflake: Snowflake,
    Fan,
    Smartphone,
    Lightbulb,
    Wind,
    WashingMachine,
    Headphones,
    Ear,
    Package,
    Layers,
    Sparkles,
    Zap,
    Radio,
    Speaker,
    Cpu,
    Tablet,
    Watch,
    Flame,
    Volume2,
  };

  const IconComponent = iconMap[name] || Package;
  return <IconComponent {...props} />;
};
