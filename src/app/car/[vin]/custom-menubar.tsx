import React from "react";

interface CustomMenuBarProps {
  options: string[];
  onSelect: (option: string) => void;
}

const CustomMenuBar: React.FC<CustomMenuBarProps> = ({ options, onSelect }) => {
  return (
    <div className="relative inline-block text-left">
      <button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
        Type
      </button>
      <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
        <div className="py-1">
          {options.map((option, index) => (
            <div key={index}>
              <button
                className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                onClick={() => onSelect(option)}
              >
                {option}
              </button>
              {index < options.length - 1 && (
                <div className="border-t border-gray-100 my-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomMenuBar;
