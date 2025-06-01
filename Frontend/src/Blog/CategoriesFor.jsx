import React from "react";
import { Autocomplete, TextField } from "@mui/material";

const categories = [
  "Technology", "Travel", "Education", "Health", 
  "Lifestyle", "Food", "Business"
];

const CategoriesForm = ({ value, onChange, disabled }) => {
  return (
    <Autocomplete
      options={categories}
      value={value || ""} // ✅ fallback to string
      disabled={disabled}
      onChange={(event, newValue) => onChange(newValue || "")} // ✅ fallback to ""
      renderInput={(params) => (
        <TextField {...params} label="Select Category" placeholder="Type to search..." />
      )}
    />
  );
};

export default CategoriesForm;
