import React from 'react';
import clsx from 'clsx';

export const Button = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
    const baseStyles = "inline-flex items-center justify-content gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 focus:ring-amber-500 shadow-md hover:shadow-lg",
        secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400",
        danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
    };

    return (
        <button
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
};

export const Input = ({ label, error, className, ...props }) => (
    <div className="w-full">
        {label && <label>{label}</label>}
        <input
            className={clsx(
                error && "border-red-500 focus:ring-red-500 focus:border-red-500",
                className
            )}
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export const Select = ({ label, error, options = [], className, ...props }) => (
    <div className="w-full">
        {label && <label>{label}</label>}
        <select
            className={clsx(
                error && "border-red-500 focus:ring-red-500",
                className
            )}
            {...props}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export const Card = ({ children, title, action, className }) => (
    <article className={clsx("card", className)}>
        {(title || action) && (
            <header className="card-header">
                {title && <h3 className="card-title">{title}</h3>}
                {action && <div>{action}</div>}
            </header>
        )}
        {children}
    </article>
);

export const Table = ({ headers, children }) => (
    <div className="table-container">
        <table>
            <thead>
                <tr>
                    {headers.map((header, idx) => (
                        <th key={idx}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {children}
            </tbody>
        </table>
    </div>
);

export const StatCard = ({ title, value, icon: Icon, color = 'gold' }) => {
    const colors = {
        gold: 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white',
        blue: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white',
        green: 'bg-gradient-to-br from-green-400 to-green-600 text-white',
        gray: 'bg-gradient-to-br from-gray-600 to-gray-800 text-white',
    };

    return (
        <div className="stat-card">
            <div className="flex items-center justify-between">
                <p className="stat-card-label">{title}</p>
                <div className={clsx("stat-card-icon", colors[color])}>
                    {Icon && <Icon size={20} />}
                </div>
            </div>
            <p className="stat-card-value">{value}</p>
        </div>
    );
};

export const Badge = ({ children, variant = 'success' }) => {
    const variants = {
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
    };
    return <span className={clsx('badge', variants[variant])}>{children}</span>;
};

export const PageHeader = ({ title, subtitle, action }) => (
    <header className="page-header flex items-center justify-between">
        <div>
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
    </header>
);
