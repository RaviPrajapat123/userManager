import * as React from 'react';
import PropTypes from 'prop-types';
import {
    Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TableSortLabel,
    Toolbar,
    Typography,
    Paper,
    Button,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Avatar,
    Chip,
    Pagination,
    // ArrowBack as BackIcon,
    TextField
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import "./BlogTable.css"

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
    { id: 'S.No.', label: 'S.No.', align: 'center' },
    { id: 'Image', label: 'Image', align: 'center' },
    { id: 'Title', label: 'Title', align: 'center' },
    { id: 'Category', label: 'Category', align: 'center' },
    { id: 'Tags', label: 'Tags', align: 'center' },
    { id: 'Description', label: 'Description', align: 'center' },
    { id: 'Author', label: 'Author', align: 'center' },
    { id: 'Created_Date', label: 'Created', align: 'center' },
    { id: 'Updated_Date', label: 'Updated', align: 'center' },
    { id: 'Actions', label: 'Actions', align: 'center' },
];

function EnhancedTableHead({ order, orderBy, onRequestSort }) {
    const createSortHandler = (property) => (event) => onRequestSort(event, property);
    const navigate=useNavigate()
    return (
        <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {headCells.map((cell) => (
                    <TableCell
                        key={cell.id}
                        align={cell.align}
                        sortDirection={orderBy === cell.id ? order : false}
                        sx={{ fontWeight: 'bold', color: '#555' }}
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
            </TableRow>
        </TableHead>
    );
}

function EnhancedTableToolbar({ search, setSearch, selectedCategory, setSelectedCategory, 
    selectedTag, setSelectedTag, categories, tags, loading, refetch }) {
    const navigate = useNavigate();

    return (
        <Toolbar sx={{ 
            p: 2, 
            backgroundColor: 'white', 
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2
        }}>
            <TextField
                variant="outlined"
                size="small"
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
                sx={{ 
                    minWidth: 300,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                    }
                }}
            />

            <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Category</InputLabel>
                <Select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)} 
                    label="Category"
                    sx={{ borderRadius: 2 }}
                >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((cat, index) => 
                        <MenuItem key={index} value={cat.name}>{cat.name}</MenuItem>
                    )}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Tag</InputLabel>
                <Select 
                    value={selectedTag} 
                    onChange={(e) => setSelectedTag(e.target.value)} 
                    label="Tag"
                    sx={{ borderRadius: 2 }}
                >
                    <MenuItem value="">All Tags</MenuItem>
                    {tags.map((tag, index) => 
                        <MenuItem key={index} value={tag.name}>{tag.name}</MenuItem>
                    )}
                </Select>
            </FormControl>

            <Box sx={{ flexGrow: 1 }} />

            <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/Blog/Create')}
                sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3,
                    py: 1
                }}
            >
                Add Blog
            </Button>

            <Button 
                variant="outlined" 
                startIcon={<BackIcon />}
                onClick={()=>navigate("/")}
                disabled={loading}
                sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3,
                    py: 1
                }}
            >
                Back
            </Button>
        </Toolbar>
    );
}


export default function EnhancedTable() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('profile');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [categories,setCategories]=useState([])
    const [tags,setTags]=useState([])

    // const refetch = () => {
    //     setLoading(true);
    //     axios.get('http://localhost:3000/Blog')
    //         .then(res => {
    //             setUsers(res.data.users);
    //         })
    //         .catch(console.error)
    //         .finally(() => setLoading(false));
    // };
   
    useEffect(() => {
        setLoading(true);
        axios.get('http://localhost:3000/Blog')
            .then(res => {
                setUsers(res.data.users);
                setLoading(false);
            })
            .catch(error => {
                console.error(error);
                setLoading(false);
            });
        axios.get('http://localhost:3000/categories')
            .then(res => {
                setCategories(res.data.categories||[]);
                setLoading(false);
                console.log(("cat=",res.data.categories))
            })
            .catch(error => {
                console.error(error);
                setLoading(false);
            });
        axios.get('http://localhost:3000/tags')
            .then(res => {
                setTags(res.data.tags||[]);
                setLoading(false);
                                console.log(("tags=",res.data.tags))

            })
            .catch(error => {
                console.error(error);
                setLoading(false);
            });
    }, []);

   const formatDob = (dob) => {
        if (!dob) return '';
        const [date, month, year] = dob.split("/");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${months[parseInt(month) - 1]} ${date}, ${year}`;
    };

const getTimeDifference = (timestamp) => {
    // let a=Date.now()
  const diffInSeconds = Math.floor((currentTime-timestamp) / 1000);
  if (diffInSeconds < 0) return '0s ago';

  const years = Math.floor(diffInSeconds / (3600 * 24 * 365));
  const weeks = Math.floor((diffInSeconds % (3600 * 24 * 365)) / (3600 * 24 * 7));
  const days = Math.floor((diffInSeconds % (3600 * 24 * 7)) / (3600 * 24));
  const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = diffInSeconds % 60;

  let result = '';
  if (years) result += `${years}y `;
  if (weeks) result += `${weeks}w `;
  if (days) result += `${days}d `;
  if (hours) result += `${hours}h `;
  if (minutes) result += `${minutes}m `;
  if (seconds) result += `${seconds}s `;

  return result.trim() + ' ago';
};



   const filtered = users.filter(u => {
    const term = search.toLowerCase().trim();

    const matchesSearch = [u.Title, u.Description, u.Author, formatDob(u.createdAt), formatDob(u.updatedAt)]
        .some(field => (field || '').toLowerCase().includes(term));

    const matchesCategory = selectedCategory
        ? (Array.isArray(u.Categories)
            ? u.Categories.includes(selectedCategory)
            : u.Categories === selectedCategory)
        : true;
    const matchesTag = selectedTag
        ? (Array.isArray(u.Tags)
            ? u.Tags.includes(selectedTag)
            : u.Tags === selectedTag)
        : true;

     return matchesSearch && matchesCategory && matchesTag;
});

    const totalPages = Math.ceil(filtered.length / rowsPerPage);
    const visibleRows = filtered.sort(getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
        if (user) navigate(`/blog/${user._id}/view`, { state: { mode: 'view', user } });
    };
    const onEdit = () => {
        const user = filtered.find(u => u._id === selected[0]);
        if (user) navigate(`/blog/${user._id}/edit`, { state: { mode: 'edit', user } });
    };
    const onDelete = async (id) => {
        const idToDelete = id || selected[0];
        try {
            if (window.confirm("Are you sure you want to delete this blog?")) {
                await axios.delete(`http://localhost:3000/Blog/${idToDelete}`);
                setUsers(prev => prev.filter(u => u._id !== idToDelete));
                setSelected([]);
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Delete failed");
        }
    };

    return (
        <Box sx={{ width: '100%' , p: 3}}>
                        <Paper elevation={2} sx={{ 
                borderRadius: 3,
                overflow: 'hidden'
            }}>

                <EnhancedTableToolbar
                    numSelected={selected.length}
                    search={search}
                    setSearch={setSearch}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedTag={selectedTag}
                    setSelectedTag={setSelectedTag}
                    categories={categories}
                    tags={tags}
                />
                <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)', minHeight: "auto" }}>
                       <Table stickyHeader>
                        <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                        />
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell  colSpan={8} align="center" sx={{ py: 5 }}>
                                    <CircularProgress />
                                      <Typography variant="body2" sx={{ mt: 2 }}>Loading blogs...</Typography>
                                </TableCell></TableRow>
                            ) : filtered.length > 0 ? (
                                visibleRows.map((row, idx) => (
                                    <TableRow key={row._id} hover>
                                        <TableCell align="center" sx={{ color: '#666' }}>{highlight(page * rowsPerPage + idx + 1, search)}</TableCell>
                                        <TableCell align="center"><img src={row.image} alt="blog" style={{ width: 60, height: 60, objectFit: 'contain' }} /></TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'medium' }}>{highlight(row.Title || '-', search)}</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'medium' }}>{highlight(row.Categories || '-', search)}</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'medium' }}>{highlight(row.Tags || '-', search)}</TableCell>
                                        <TableCell align="center" sx={{ 
                                            maxWidth: 300,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>{highlight(row.Description || '-', search)}</TableCell>
                                        <TableCell align="center"> <Chip 
                                                label={highlight(row.Author || '-', search)} 
                                                size="small"
                                                sx={{ 
                                                    backgroundColor: '#e3f2fe',
                                                    color: '#1976d2'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: '#666', fontSize: 14 }}>{highlight(formatDob(row.createdAt) || '-', search)}</TableCell>
                                        <TableCell align="center" sx={{ color: '#666', fontSize: 14 }}>{highlight(formatDob(row.updatedAt) || '-', search)}</TableCell>

                                        {/* {(row.createdAt)===(row.updatedAt)?(
                                        <TableCell align="center" sx={{ color: '#666', fontSize: 14 }}>{highlight(formatDob(row.updatedAt) || '-', search)}</TableCell>): 
                                        
                                        (<TableCell align="center" sx={{ color: '#666', fontSize: 14 }}>{highlight(
     getTimeDifference(row.created_date),search)}
</TableCell>
)} */}
                                        <TableCell align="center">
                                            <Button onClick={() => navigate(`/Blog/${row._id}/view`, { state: { mode: 'view', Blog: row } })} startIcon={<ViewIcon />} ></Button>
                                            <Button onClick={() => navigate(`/Blog/${row._id}/edit`, { state: { mode: 'edit', Blog: row } })}  
                startIcon={<EditIcon />}></Button>
                                            <Button color="error" onClick={() => onDelete(row._id)} startIcon={<DeleteIcon />}></Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={8} align="center" >
                                     <Typography variant="h6" color="textSecondary">
                                            No blogs found
                                        </Typography>
                                        
                                        </TableCell>
                                    </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                 <Box sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderTop: '1px solid #e0e0e0',
                    backgroundColor: '#fafafa'
                }}>
                    <Typography sx={{ color: '#666', paddingLeft:"20px" }}>Total: {filtered.length}</Typography>
              

<Box sx={{ 
    display: 'flex',
    alignItems: 'center',
    gap: 1
}}>
    {/* Rows per page selector */}
    <FormControl size="small" sx={{ minWidth: 80 }}>
        <Select
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            sx={{
                borderRadius: 1,
                height: 36,
                '& .MuiSelect-select': {
                    py: 1,
                    px: 1.5
                }
            }}
        >
            {[5, 10, 20, 50].map(n => (
                <MenuItem key={n} value={n}>{`${n} per page`}</MenuItem>
            ))}
        </Select>
    </FormControl>

    {/* Pagination controls */}
    <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Button
            variant="outlined"
            size="small"
            onClick={goToFirst}
            disabled={page === 0}
            sx={{ 
                minWidth: 32,
                height: 32,
                borderRadius: 1 
            }}
        >
            First
        </Button>
        <Button
            variant="outlined"
            size="small"
            onClick={handlePrev}
            disabled={page === 0}
            sx={{ 
                minWidth: 32,
                height: 32,
                borderRadius: 1 
            }}
        >
            Prev
        </Button>
        
        <Box sx={{ 
            display: 'flex',
            '& button': {
                minWidth: 32,
                height: 32,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                color: 'text.primary',
                '&.active': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    borderColor: 'primary.main'
                },
                '&:hover': {
                    backgroundColor: 'action.hover'
                }
            }
        }}>
            {Array.from({ length: totalPages }, (_, index) => (
                <button 
                    key={index} 
                    onClick={() => setPage(index)} 
                    className={page === index ? "active" : ""}
                >
                    {index + 1}
                </button>
            ))}
        </Box>
        
        <Button
            variant="outlined"
            size="small"
            onClick={handleNext}
            disabled={page === totalPages - 1}
            sx={{ 
                minWidth: 32,
                height: 32,
                borderRadius: 1 
            }}
        >
            Next
        </Button>
        <Button
            variant="outlined"
            size="small"
            onClick={goToLast}
            disabled={page === totalPages - 1}
            sx={{ 
                minWidth: 32,
                height: 32,
                borderRadius: 1 
            }}
        >
            Last
        </Button>
    </Box>
</Box>
                </Box>
            </Paper>
        </Box>
    );
}
