import React from 'react';

interface CardProps {
    children: React.ReactNode;
    classes?: string;
}

export const Card: React.FC<CardProps> = ({ children, classes = '' }) => {
    return (
        <div className={`bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 ${classes}`}>
            {children}
        </div>
    );
};