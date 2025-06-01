import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import axios from "axios";
import * as yup from "yup";

// Yup schema
const categorySchema = yup.object().shape({
  name: yup.string().required("Category name is required").min(2).max(50),
});

const TagsForm = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const mode = state?.mode || "create"; // "edit" or "view"
  const user = state?.tagName || {};        // category object from previous screen
    console.log("first",state)
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill the form
  useEffect(() => {
    if (mode === "edit" || mode === "view") {
      if (user) {
        setName(user);
      }
    }
    setLoading(false);
  }, [user, mode]);

  const handleSubmit = async () => {
    setError("");
    try {
      await categorySchema.validate({ name });
      setSaving(true);

      await axios.put(`http://localhost:3000/tags/${id}`, { name });

      navigate(-1);
    } catch (err) {
      if (err.name === "ValidationError") {
        setError(err.errors[0]);
      } else {
        setError(err.response?.data?.error || "Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" mb={3}>
          {mode === "view" ? "View Category" : "Edit Category"}
        </Typography>

       {mode==="view" && (
        <>
        <TextField
          label="Category Name"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={mode === "view"}
          error={Boolean(error)}
          helperText={error}
        />
        <Button
              variant="contained"
              color="primary"
             
              onClick={()=>navigate(-1)}
              disabled={saving}
              style={{marginTop:"20px"}}
            >Back</Button>
            </>
            )


       }

        {mode === "edit" && (
          <Box mt={3} display="flex" justifyContent="space-between">
            <Button onClick={() => navigate(-1)}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Saving..." : "Update"}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default TagsForm;
