export default function Button({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, icon = null, className = '', type = 'button', ...rest
}) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <span className="btn-spinner" /> : icon}
      {children}
    </button>
  );
}
