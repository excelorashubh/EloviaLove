import React from 'react';
import { BadgeCheck } from 'lucide-react';

export default function VerifiedBadge({ size = 18, className = '' }) {
  return (
    <BadgeCheck size={size} className={`text-blue-500 ${className}`} />
  );
}
