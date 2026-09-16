import React, { useState } from 'react';
import {
  Smartphone,
  Flame,
  Cloud,
  Coins,
  BarChart2,
  Search,
  Mail,
  HardDrive,
  Calendar,
  Receipt,
  GitBranch,
  Triangle,
  PenTool,
  CheckSquare,
  AlertTriangle,
  Database,
  Globe
} from 'lucide-react';
import { detectService } from '../../services/routing/serviceRegistry';
import { UrlNormalizer } from '../../services/routing/urlNormalizer';

interface ServiceIconProps {
  url: string;
  domain?: string;
  customFavicon?: string;
  className?: string;
  size?: number;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({
  url,
  customFavicon,
  className = 'w-5 h-5',
  size = 20
}) => {
  const [imgError, setImgError] = useState(false);
  const service = detectService(url);
  const faviconUrl = customFavicon || UrlNormalizer.getFaviconUrl(url, 64);

  // Try high-resolution favicon first if available and not errored
  if (faviconUrl && !imgError) {
    return (
      <img
        src={faviconUrl}
        alt=""
        className={`object-contain rounded-sm ${className}`}
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
        loading="lazy"
      />
    );
  }

  // Fallback to recognized service icon
  if (service) {
    switch (service.iconName) {
      case 'Smartphone':
        return <Smartphone className={className} style={{ color: service.brandColor }} />;
      case 'Flame':
        return <Flame className={className} style={{ color: service.brandColor }} />;
      case 'Cloud':
        return <Cloud className={className} style={{ color: service.brandColor }} />;
      case 'Coins':
        return <Coins className={className} style={{ color: service.brandColor }} />;
      case 'BarChart2':
        return <BarChart2 className={className} style={{ color: service.brandColor }} />;
      case 'Search':
        return <Search className={className} style={{ color: service.brandColor }} />;
      case 'Mail':
        return <Mail className={className} style={{ color: service.brandColor }} />;
      case 'HardDrive':
        return <HardDrive className={className} style={{ color: service.brandColor }} />;
      case 'Calendar':
        return <Calendar className={className} style={{ color: service.brandColor }} />;
      case 'Receipt':
        return <Receipt className={className} style={{ color: service.brandColor }} />;
      case 'GitBranch':
        return <GitBranch className={className} style={{ color: service.brandColor }} />;
      case 'Triangle':
        return <Triangle className={className} style={{ color: service.brandColor }} />;
      case 'Figma':
        return <PenTool className={className} style={{ color: service.brandColor }} />;
      case 'CheckSquare':
        return <CheckSquare className={className} style={{ color: service.brandColor }} />;
      case 'AlertTriangle':
        return <AlertTriangle className={className} style={{ color: service.brandColor }} />;
      case 'Database':
        return <Database className={className} style={{ color: service.brandColor }} />;
    }
  }

  return <Globe className={`${className} text-slate-400`} />;
};
