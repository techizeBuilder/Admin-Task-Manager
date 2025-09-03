import React from "react";
import Select from "react-select";

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  isMulti = false,
  className = "",
  isDisabled = false,
  isClearable = false,
  menuPlacement = "auto",
  ...props
}) => {
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "42px",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
          ? "#eff6ff"
          : "white",
      color: state.isSelected ? "white" : "#374151",
      "&:hover": {
        backgroundColor: state.isSelected ? "#3b82f6" : "#eff6ff",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#eff6ff",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#1f2937",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#6b7280",
      "&:hover": {
        backgroundColor: "#fee2e2",
        color: "#dc2626",
      },
    }),
  };

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isMulti={isMulti}
      isDisabled={isDisabled}
      isClearable={isClearable}
      isSearchable={true}
      menuPlacement={menuPlacement}
      menuPortalTarget={document.body}
      styles={customStyles}
      className={className}
      classNamePrefix="react-select"
      {...props}
    />
  );
};

export default SearchableSelect;
