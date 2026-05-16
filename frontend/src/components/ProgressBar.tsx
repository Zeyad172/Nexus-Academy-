interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

const ProgressBar = ({ value, className = "", showLabel = true }: ProgressBarProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full gradient-primary transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-small font-medium text-muted-foreground whitespace-nowrap">{value}%</span>
      )}
    </div>
  );
};

export default ProgressBar;
