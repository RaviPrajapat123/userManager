import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import * as yup from "yup";

const categorySchema = yup.object().shape({
  name: yup.string().required("Category name is required").min(2).max(50),
});

const CategoriesTable = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    setLoading(true);
    axios
      .get("http://localhost:3000/categories")
      .then((res) => {
        setCategories(res.data.categories || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const openAddDialog = () => {
    setNewCategory("");
    setError("");
    setEditingCategory(null);
    setOpen(true);
  };

  const openEditDialog = (category) => {
    setEditingCategory(category);
    setNewCategory(category.name);
    setError("");
    setOpen(true);
  };

  const handleView = (category) => {
    //  const user = filteredCategories.find(u => u._id === selected[0]);
  // if (user) {
  const cate=category.name
  console.log("category=",category._id)
    navigate(`/Categories/:${category._id}/view`, { state: { mode: 'view', cate } });
  // }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) return;
    try {
      await axios.delete(`http://localhost:3000/categories/${category._id}`);
      fetchCategories();
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  const handleSaveCategory = async () => {
    setError("");
    try {
      await categorySchema.validate({ name: newCategory });
      setAdding(true);

      if (editingCategory) {
        await axios.put(`http://localhost:3000/categories/${editingCategory._id}`, {
          name: newCategory.trim(),
        });
      } else {
        await axios.post("http://localhost:3000/categories", {
          name: newCategory.trim(),
        });
      }

      setNewCategory("");
      setEditingCategory(null);
      setOpen(false);
      fetchCategories();
    } catch (err) {
      if (err.name === "ValidationError") {
        setError(err.errors[0]);
      } else if (err.response?.data?.error) {
        setError(Array.isArray(err.response.data.error) ? err.response.data.error.join(", ") : err.response.data.error);
      } else {
        setError("Failed to save category");
      }
    } finally {
      setAdding(false);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getHighlightedText = (text, highlight) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <b key={i} style={{ fontWeight: "bold" }}>{part}</b>
      ) : (
        part
      )
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, margin: "0 auto" }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate("/")}>
            Back
          </Button>
          <Typography variant="h4" sx={{ flexGrow: 1, textAlign: "center" }}>
            Blog Categories
          </Typography>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openAddDialog}>
            Add Category
          </Button>
        </Box>

        <TextField
          label="Search Categories"
          variant="outlined"
          fullWidth
          size="small"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          sx={{ mb: 2 }}
        />

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 500 }}>
            
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.main" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>S.NO</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Category Name</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedCategories.length > 0 ? (
                paginatedCategories.map((cat, index) => (
                  <TableRow key={cat._id} hover sx={{ "&:nth-of-type(odd)": { backgroundColor: "action.hover" } }}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{getHighlightedText(cat.name, searchTerm)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View">
                        <IconButton onClick={() => handleView(cat)} color="primary" size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => openEditDialog(cat)} color="info" size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(cat)} color="error" size="small">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No categories found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  count={filteredCategories.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  colSpan={3}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setError("");
          setNewCategory("");
          setEditingCategory(null);
        }}
      >
        <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            error={Boolean(error)}
            helperText={error}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              setError("");
              setNewCategory("");
              setEditingCategory(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            color="primary"
            disabled={adding || !newCategory.trim()}
          >
            {adding ? (editingCategory ? "Saving..." : "Adding...") : editingCategory ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesTable;
