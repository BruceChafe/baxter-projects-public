import React from "react";
import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { ColumnVisibility } from "../../../types";

interface ColumnSelectorProps {
  columns: ColumnVisibility;
  setColumns: React.Dispatch<React.SetStateAction<ColumnVisibility>>;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({ columns, setColumns }) => {
  const handleToggleColumn = (column: keyof ColumnVisibility) => {
    setColumns((prevColumns: ColumnVisibility) => ({
      ...prevColumns,
      [column]: !prevColumns[column],
    }));
  };

  const handleSelectAllFields = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setColumns({
      first_name: isChecked,
      jobTitle: isChecked,
      department: isChecked,
      dealership: isChecked,
      address: isChecked,
      city: isChecked,
      state: isChecked,
      email: isChecked,
      phoneNumber: isChecked,
      dateCreated: isChecked,
      lastLogin: isChecked,
      isActive: isChecked,
    });
  };

  return (
    <FormGroup row>
      <FormControlLabel
        control={
          <Checkbox
            checked={Object.values(columns).every(Boolean)}
            onChange={handleSelectAllFields}
          />
        }
        label="Select All"
      />
      {Object.keys(columns).map((column) => (
        <FormControlLabel
          key={column}
          control={
            <Checkbox
              checked={columns[column as keyof ColumnVisibility]}
              onChange={() => handleToggleColumn(column as keyof ColumnVisibility)}
            />
          }
          label={column.charAt(0).toUpperCase() + column.slice(1)}
        />
      ))}
    </FormGroup>
  );
};

export default ColumnSelector;
