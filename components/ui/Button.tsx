
import React from 'react';
import { THEME_COLORS } from '../../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
    return (
        <button
            {...props}
            className="px-4 py-2 text-white font-semibold rounded-md shadow-sm transition-colors duration-200 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: THEME_COLORS.secondary,
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#af894f'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = THEME_COLORS.secondary}
        >
            {children}
        </button>
    );
};
