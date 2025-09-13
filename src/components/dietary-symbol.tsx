
import type { DietaryType } from "@/lib/data";
import { cn } from "@/lib/utils";

type DietarySymbolProps = {
    type?: DietaryType;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
};

export function DietarySymbol({ type, size = 'md', className }: DietarySymbolProps) {
    if (!type) return null;

    const symbolColor = type === 'veg' ? 'border-green-600' : 'border-red-600';
    const dotColor = type === 'veg' ? 'bg-green-600' : 'bg-red-600';
    const symbolSize = sizeClasses[size];

    if (type === 'egg') {
       return (
            <div className={cn("inline-flex items-center justify-center p-0.5 border-2 border-yellow-600", symbolSize, className)}>
                <div className="w-full h-full rounded-full bg-yellow-600" />
            </div>
       )
    }

    return (
        <div className={cn("inline-flex items-center justify-center p-0.5 border-2", symbolColor, symbolSize, className)}>
            {type === 'veg' ? (
                <div className="w-full h-full rounded-full bg-green-600" />
            ) : (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-600">
                    <path d="M0 24L12 0L24 24H0Z" fill="currentColor"/>
                </svg>
            )}
        </div>
    );
}
