import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
    name?: string;
    fallback?: React.ReactNode;
}

export default function DynamicIcon({ name, fallback = '📁', ...props }: DynamicIconProps) {
    if (!name) return <span style={{ fontSize: 'inherit' }}>{fallback}</span>;

    const IconComponent = (LucideIcons as any)[name];

    if (!IconComponent) {
        return <span style={{ fontSize: 'inherit' }}>{fallback}</span>;
    }

    return <IconComponent {...props} />;
}
