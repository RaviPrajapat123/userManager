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

// Validation schema using Yup
const tagSchema = yup.object().shape({
  name: yup.string().required("Tag name is required").min(2).max(50),
});

const TagsTable = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/tags");
      setTags(res.data.tags || []);
    //   console.log("first",res.data.tags[0].name)
    } catch (err) {
      console.error("Failed to fetch tags", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setNewTag("");
    setError("");
    setEditingTag(null);
    setOpen(true);
  };

  const openEditDialog = (tag) => {
    setEditingTag(tag);
    setNewTag(tag.name);
    setError("");
    setOpen(true);
  };

  const handleView = (tag) => {
    navigate(`/tags/:${tag._id}/view`, { state: { mode: "view", tagName: tag.name } });
  };

  const handleDelete = async (tag) => {
    if (!window.confirm(`Are you sure you want to delete "${tag.name}"?`)) return;
    try {
      await axios.delete(`http://localhost:3000/tags/${tag._id}`);
      fetchTags();
    } catch (err) {
      alert("Failed to delete tag");
    }
  };

  const handleSaveTag = async () => {
    setError("");
    try {
      await tagSchema.validate({ name: newTag });
      setSaving(true);

      if (editingTag) {
        await axios.put(`http://localhost:3000/tags/${editingTag._id}`, {
          name: newTag.trim(),
        });
      } else {
        await axios.post("http://localhost:3000/tags", {
          name: newTag.trim(),
        });
      }

      setNewTag("");
      setEditingTag(null);
      setOpen(false);
      fetchTags();
    } catch (err) {
      if (err.name === "ValidationError") {
        setError(err.errors[0]);
      } else if (err.response?.data?.error) {
        const serverError = err.response.data.error;
        setError(Array.isArray(serverError) ? serverError.join(", ") : serverError);
      } else {
        setError("Failed to save tag");
      }
    } finally {
      setSaving(false);
    }
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedTags = filteredTags.slice(
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
            Tags
          </Typography>
          <Button variant="contained" color="primary" startIcon={<AddIcon />}
           onClick={openAddDialog}>
            Add Tag
          </Button>
        </Box>

        <TextField
          label="Search Tags"
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

        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)', minHeight: "auto" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.main" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>S.NO</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Tag Name</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedTags.length > 0 ? (
                paginatedTags.map((tag, index) => (
                  <TableRow key={tag._id} hover sx={{ "&:nth-of-type(odd)": { backgroundColor: "action.hover" } }}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{getHighlightedText(tag.name, searchTerm)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View">
                        <IconButton onClick={() => handleView(tag)} color="primary" size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => openEditDialog(tag)} color="info" size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(tag)} color="error" size="small">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No tags found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  count={filteredTags.length} 
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
          setNewTag("");
          setEditingTag(null);
        }}
      >
        <DialogTitle>{editingTag ? "Edit Tag" : "Add New Tag"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tag Name"
            fullWidth
            variant="outlined"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
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
              setNewTag("");
              setEditingTag(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveTag}
            variant="contained"
            color="primary"
            disabled={saving || !newTag.trim()}
          >
            {saving ? (editingTag ? "Saving..." : "Adding...") : editingTag ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TagsTable;
