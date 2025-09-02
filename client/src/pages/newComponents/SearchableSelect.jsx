import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

const SearchableSelect = ({
  options = [],
  value = "",
  onChange,
  placeholder = "Select option...",
  className = "",
  multiple = false,
  searchable = true,
  clearable = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState(
    multiple ? (Array.isArray(value) ? value : []) : value
  );
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = searchable
    ? options.filter((option) =>
        (option.label || option.name || option.toString())
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    if (multiple) {
      const optionValue = option.value || option.id || option;
      const newSelection = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      
      setSelectedValues(newSelection);
      onChange && onChange(newSelection);
    } else {
      const optionValue = option.value || option.id || option;
      setSelectedValues(optionValue);
      onChange && onChange(optionValue);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (multiple) {
      setSelectedValues([]);
      onChange && onChange([]);
    } else {
      setSelectedValues("");
      onChange && onChange("");
    }
  };

  const getDisplayValue = () => {
    if (multiple) {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const option = options.find(
          (opt) => (opt.value || opt.id || opt) === selectedValues[0]
        );
        return option ? (option.label || option.name || option.toString()) : selectedValues[0];
      }
      return `${selectedValues.length} items selected`;
    } else {
      if (!selectedValues) return placeholder;
      const option = options.find(
        (opt) => (opt.value || opt.id || opt) === selectedValues
      );
      return option ? (option.label || option.name || option.toString()) : selectedValues;
    }
  };

  const isSelected = (option) => {
    const optionValue = option.value || option.id || option;
    if (multiple) {
      return selectedValues.includes(optionValue);
    }
    return selectedValues === optionValue;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Input */}
      <div
        className={`
          flex items-center justify-between w-full px-3 py-2 border border-gray-300 
          rounded-md bg-white cursor-pointer hover:border-gray-400 transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`truncate ${!selectedValues || (multiple && selectedValues.length === 0) ? 'text-gray-500' : 'text-gray-900'}`}>
          {getDisplayValue()}
        </span>
        
        <div className="flex items-center gap-1">
          {clearable && (selectedValues && (!multiple || selectedValues.length > 0)) && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded"
              type="button"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                {searchTerm ? 'No results found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = option.value || option.id || option;
                const optionLabel = option.label || option.name || option.toString();
                
                return (
                  <div
                    key={`${optionValue}-${index}`}
                    className={`
                      px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors
                      ${isSelected(option) ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                    `}
                    onClick={() => handleSelect(option)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{optionLabel}</span>
                      {multiple && isSelected(option) && (
                        <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;