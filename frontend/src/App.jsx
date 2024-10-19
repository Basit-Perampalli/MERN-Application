import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, PieChart } from '@mui/x-charts';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Pagination,
} from '@mui/material';

const App = () => {
  // State variables
  const [month, setMonth] = useState('01');  // Default month is March (03)
  const [transactions, setTransactions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statistics, setStatistics] = useState({ totalSaleAmount: 0, soldItems: 0, unsoldItems: 0 });
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);

  // Fetch Transactions
  const fetchTransactions = async (page = 1) => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/products', {
        params: { month, page, search }
      });
      setTransactions(data.products);
      // setTotalPages(Math.ceil(data.total / 10));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Fetch Statistics
  const fetchStatistics = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/statistics', {
        params: { month }
      });
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Fetch Bar Chart Data
  const fetchBarChartData = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/bar-chart', { params: { month } });
      setBarData(data);
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
    }
  };

  // Fetch Pie Chart Data
  const fetchPieChartData = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/pie-chart', { params: { month } });
      setPieData(data);
    } catch (error) {
      console.error('Error fetching pie chart data:', error);
    }
  };

  // Effect Hook to fetch all data whenever `month` or `search` changes
  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
    fetchBarChartData();
    fetchPieChartData();
  }, [month, search, currentPage]);

  // Handle month change
  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  // Handle search change
  const handleSearchChange = (e) => {
    e.preventDefault()
    console.log(e.target.value)
    setSearch(e.target.value);
  };

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Product Transactions Dashboard
      </Typography>

      {/* Month Dropdown */}
      <FormControl sx={{ minWidth: 120, marginRight: '20px' }}>
        <InputLabel id="month-select-label">Select Month</InputLabel>
        <Select
          labelId="month-select-label"
          id="month-select"
          value={month}
          label="Select Month"
          onChange={handleMonthChange}
        >
          <MenuItem value="01">January</MenuItem>
          <MenuItem value="02">February</MenuItem>
          <MenuItem value="03">March</MenuItem>
          <MenuItem value="04">April</MenuItem>
          <MenuItem value="05">May</MenuItem>
          <MenuItem value="06">June</MenuItem>
          <MenuItem value="07">July</MenuItem>
          <MenuItem value="08">August</MenuItem>
          <MenuItem value="09">September</MenuItem>
          <MenuItem value="10">October</MenuItem>
          <MenuItem value="11">November</MenuItem>
          <MenuItem value="12">December</MenuItem>
        </Select>
      </FormControl>

      {/* Search Input */}
      <TextField
        id="search"
        label="Search Transactions"
        variant="outlined"
        value={search}
        onChange={handleSearchChange}
        sx={{ minWidth: '300px' }}
      />

      {/* Transactions Table */}
      <Typography variant="h6" gutterBottom sx={{ marginTop: '20px' }}>
        Transactions Table
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {/* <TableCell>ID</TableCell> */}
              <TableCell>Title</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Sold</TableCell>
              <TableCell>Date of Sale</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map(transaction => (
              <TableRow key={transaction.id}>
                {/* <TableCell>{transaction.id}</TableCell> */}
                <TableCell>{transaction.title}</TableCell>
                <TableCell>{transaction.price}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.sold ? 'Yes' : 'No'}</TableCell>
                <TableCell>{new Date(transaction.dateOfSale).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <Pagination
        count={6}
        page={currentPage}
        onChange={(e, value) => setCurrentPage(value)}
        sx={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
      />

      {/* Statistics Section */}
      <Box sx={{ marginTop: '20px' }}>
        <Typography variant="h6" gutterBottom>
          Statistics for {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
        </Typography>
        <Typography>Total Sale Amount: ${statistics.totalSaleAmount}</Typography>
        <Typography>Total Sold Items: {statistics.soldItems}</Typography>
        <Typography>Total Unsold Items: {statistics.unsoldItems}</Typography>
      </Box>

      {/* Bar Chart Section */}
      {/* <Box sx={{ marginTop: '20px', width: '600px', height: '400px' }}>
        <Typography variant="h6" gutterBottom>
          Price Range Distribution
        </Typography>
        <BarChart
          xAxis={{
            data: barData.map(item => item.range),
          }}
          series={[
            {
              data: barData.map(item => item.count),
              label: 'Number of Items',
              color: '#42a5f5',
            },
          ]}
        />
      </Box> */}

      {/* Pie Chart Section */}
      <Box sx={{ marginTop: '20px', width: '600px', height: '400px' }}>
        <Typography variant="h6" gutterBottom>
          Category Distribution
        </Typography>
        <PieChart
          series={[
            {
              data: pieData.map(item => ({value:item.count,label:item.category}))
            }
          ]}
        />
      </Box>
    </Box>
  );
};

export default App;
