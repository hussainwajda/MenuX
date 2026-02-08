import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export function Select({ children, value, onValueChange, ...props }: SelectProps) {
  return (
    <div className="relative">
      {children}
    </div>
  );
}

export function SelectTrigger({ children, className, onClick }: SelectTriggerProps) {
  return (
    <button
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={onClick}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}

export function SelectContent({ children, className }: SelectContentProps) {
  return (
    <div className={`absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md ${className}`}>
      {children}
    </div>
  );
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  return (
    <button
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${className}`}
      onClick={() => {
        // This would normally be handled by the parent Select component
        console.log('Selected:', value);
      }}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder, className }: SelectValueProps) {
  return (
    <span className={`text-muted-foreground ${className}`}>
      {placeholder}
    </span>
  );
}
