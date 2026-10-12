import clsx from "clsx";

const variantStyles = {
  primary: "bg-primary text-white shadow-soft hover:bg-[#174f93]",
  secondary: "bg-primarySoft text-primary hover:bg-[#cde2ff]",
  accent: "bg-accent text-white shadow-soft hover:bg-[#df7d1d]",
  ghost: "bg-white/70 text-ink hover:bg-white",
  danger: "bg-[#FDE8E6] text-[#C2410C] hover:bg-[#fbd5d1]",
};

const sizeStyles = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  ...props
}) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

