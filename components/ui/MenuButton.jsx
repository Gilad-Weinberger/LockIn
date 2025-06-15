"use client";

const MenuButton = ({ 
  onClick, 
  icon, 
  children, 
  variant = "default", 
  disabled = false,
  className = "" 
}) => {
  const baseClasses = "px-2 py-1.5 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap text-sm";
  
  const variantClasses = {
    default: "text-gray-700 hover:bg-gray-50",
    danger: "text-red-600 hover:bg-red-50"
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      {icon && (
        <span className="w-3.5 h-3.5 flex-shrink-0">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};

export default MenuButton; 