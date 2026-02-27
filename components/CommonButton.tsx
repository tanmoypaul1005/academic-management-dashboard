"use client";

const CommonButton = ({ onClick, className,title } : { onClick: () => void, className?: string, title: string }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg ${className}`}
        >
            + {title}
        </button>
    );
};

export default CommonButton;