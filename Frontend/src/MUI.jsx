
import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  Checkbox,
  Button,
  CircularProgress,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Pagination,
  IconButton
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  FirstPage,
  LastPage,
  NavigateBefore,
  NavigateNext,
  Visibility,
  Edit,
  Delete,
  Add,
  Info,
  ArrowBack
} from '@mui/icons-material';

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

function highlight(text, query) {
  if (typeof text !== 'string') text = String(text);
  if (!text) return '';        
  if (!query) return text;
  const escaped = escapeRegExp(query);
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <strong key={i}>{part}</strong> : part
  );
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  { id: 'profile', label: 'Profile' },
  { id: 'phone', label: 'Phone' },
  { id: 'gender', label: 'Gender' },
  { id: 'birthDate', label: 'DOB' },
  { id: 'bloodGroup', label: 'Blood Group' },
  { id: 'university', label: 'Education' },
];

function EnhancedTableHead({ order, orderBy, onSelectAllClick, numSelected, rowCount, onRequestSort }) {
  const createSortHandler = (property) => (event) => onRequestSort(event, property);

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            // checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {headCells.map((cell) => (
          <TableCell
            key={cell.id}
            align="center"
            sortDirection={orderBy === cell.id ? order : false}
            sx={{ fontWeight: 600, fontSize: '0.875rem' }}
          >
            <TableSortLabel
              active={orderBy === cell.id}
              direction={orderBy === cell.id ? order : 'asc'}
              onClick={createSortHandler(cell.id)}
            >
              {cell.label}
              {orderBy === cell.id && (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              )}
            </TableSortLabel>
          </TableCell>
        ))}
        {/* <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Actions</TableCell> */}
      </TableRow>
    </TableHead>
  );
}

function EnhancedTableToolbar({ numSelected, search, setSearch, onView, onEdit, onDelete }) {
  const navigate = useNavigate();
  
  return (
    <Toolbar sx={{
      px: 2,
      py: 1,
      display: 'flex',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
    }}>
      <Button
        variant="contained"
        startIcon={<ArrowBack />}
        onClick={() => navigate("/")}
        sx={{ textTransform: 'none' }}
      >
        Back
      </Button>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => navigate('/users/create')}
        sx={{ textTransform: 'none' }}
      >
        Add User
      </Button>
      
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ width: 300, mx: 2 }}
      />
      
      {numSelected > 0 && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {numSelected === 1 && (
            <>
              <IconButton onClick={onView} color="info" title="View">
                <Visibility />
              </IconButton>
              <IconButton onClick={onEdit} color="primary" title="Edit">
                <Edit />
              </IconButton>
            </>
          )}
          <IconButton onClick={onDelete} color="error" title="Delete">
            <Delete />
          </IconButton>
        </Box>
      )}
    </Toolbar>
  );
}

// export default function EnhancedTable() {


EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default function EnhancedTable() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('profile');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const mode = pathname.split('/').pop(); // e.g., "create", "edit", "view"

  useEffect(() => {
    console.log("Current Pathname:", pathname);
    console.log("Current Mode:", mode);
  }, [pathname]);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:3000/')
      .then(res => {
        setUsers(res.data.users);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setPage(0);
  }, [search]);

    const formatDob = (dob) => {
    if (!dob) return '';
    const [year, month, date] = dob.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(month) - 1]} ${date}, ${year}`;
  };
  
  const filtered = users.filter(u => {
    const term = search.toLowerCase().trim();
    return [
      `${u.firstName} ${u.maidenName} ${u.lastName}`,
      u.email,
      u.phone,
      formatDob(u.birthDate),
      u.university,
      u.bloodGroup
    ].some(field => (String(field) || '').toLowerCase().includes(term));
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const visibleRows = filtered
    // .sort(getComparator(order, orderBy))
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleRequestSort = (e, prop) => {
    const isAsc = orderBy === prop && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(prop);
  };

  const handleSelectAllClick = () => setSelected([]);
  const handleClick = (e, _id) => setSelected(prev => (prev[0] === _id ? [] : [_id]));
  const goToFirst = () => setPage(0);
  const handlePrev = () => setPage(p => Math.max(p - 1, 0));
  const handleNext = () => setPage(p => Math.min(p + 1, totalPages - 1));
  const goToLast = () => setPage(totalPages - 1);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };



 const onView = () => {
  const user = filtered.find(u => u._id === selected[0]);
  if (user) {
    navigate(`/users/:${user._id}/view`, { state: { mode: 'view', user } });
  }
};

const onEdit = () => {
  const user = filtered.find(u => u._id === selected[0]);
  if (user) {
    navigate(`/users/:${user._id}/edit`, { state: { mode: 'edit', user } });
  }
};


  const onDelete = async () => {
    const idToDelete = selected[0];
    try {
      if (window.confirm("Are you sure you want to delete this user?")) {
        await axios.delete(`http://localhost:3000/users/${idToDelete}`);
        setUsers(prev => prev.filter(u => u._id !== idToDelete));
        setSelected([]);
        if (page >= totalPages && totalPages > 0) setPage(totalPages - 1);
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const isSelected = id => selected.indexOf(id) !== -1;
  // console.log("=",isItemSelected)

const showDetails = (item) => {
    alert(`Additional Details:\nEye Color: ${item.eyeColor}\nHair: ${item.hair.color} ${item.hair.type}\nHeight: ${item.height}\nWeight: ${item.weight}`);
  };

const genderMap = {
  male:   { label: "M", color: "primary" },
  female: { label: "F", color: "secondary" },
  other:  { label: "O", color: "default" },
};

const findGender = (gen) => {
  const gender = genderMap[gen?.toLowerCase()];
  return gender ? (
    <Chip label={gender.label} color={gender.color} size="small" />
  ) : '';
};

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          setSearch={setSearch}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
        
        <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
          <Table stickyHeader size="medium">
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={filtered.length}
            />
            
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filtered.length > 0 ? (
                visibleRows.map((row) => {
                  const isItemSelected = isSelected(row._id);
                  // console.log("selected id=",isItemSelected)
                  return (
                    <TableRow 
                      key={row._id} 
                      hover  
                      selected={isItemSelected}
                      sx={{ '&:last-child td': { borderBottom: 0 } }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox 
                          color="primary"
                          checked={isItemSelected} 
                          onClick={(e) => handleClick(e, row._id)} 
                        />
                      </TableCell>
                      
                      <TableCell align='center'>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={row.image} alt={`${row.firstName} ${row.lastName}`} />
                          <Box>
                            <Typography variant="subtitle2">
                              {highlight(`${row.firstName} ${row.maidenName} ${row.lastName}`, search)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {highlight(row.email, search)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Typography variant="body2">
                          {highlight(row.phone, search)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        {findGender(row.gender)}
                      </TableCell>
                      
                      <TableCell align="center">
                        <Typography variant="body2">
                          {highlight(formatDob(row.birthDate), search)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Chip 
                          label={highlight(row.bloodGroup, search)} 
                          color="error" 
                          size="small" 
                          variant="outlined"
                        /><br/>
                        <a  onClick={() => showDetails(row)} size="small" title="View details" style={{paddingTop:"10px",color:"blue", cursor:"pointer"}}>
                          {/* <Info fontSize="small" /> */}
                          more
                        </a>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Typography variant="body2">
                          {highlight(row.university, search)}
                        </Typography>
                      </TableCell>
                      
                      {/* <TableCell align="center">
                        <IconButton onClick={() => showDetails(row)} size="small" title="View details">
                          <Info fontSize="small" />
                        </IconButton>
                      </TableCell> */}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 2,
          borderTop: '1px solid rgba(0, 0, 0, 0.12)'
        }}>
          <Typography variant="body2" color="text.secondary">
            Total: {filtered.length} users
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              size="small"
              sx={{ mr: 2 }}
            >
              {[5, 10, 20, 50].map(option => (
                <MenuItem key={option} value={option}>
                  {option} per page
                </MenuItem>
              ))}
            </Select>
            
            <IconButton onClick={goToFirst} disabled={page === 0}>
              <FirstPage />
            </IconButton>
            <IconButton onClick={handlePrev} disabled={page === 0}>
              <NavigateBefore />
            </IconButton>
            
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={(e, value) => setPage(value - 1)}
              shape="rounded"
              size="medium"
              siblingCount={1}
              boundaryCount={1}
            />
            
            <IconButton onClick={handleNext} disabled={page >= totalPages - 1}>
              <NavigateNext />
            </IconButton>
            <IconButton onClick={goToLast} disabled={page >= totalPages - 1}>
              <LastPage />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

