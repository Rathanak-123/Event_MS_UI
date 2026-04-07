import React, { useState, useEffect, useCallback } from "react";
import { Box, Paper, Typography, Card, CardContent, Grid, Stack, Button, ButtonGroup } from "@mui/material";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import reportApi from "../../../api/report.api";
import { exportToExcel, exportToCSV } from "../../../utils/export";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

const RevenueReport = ({ filters }) => {
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [summary, setSummary] = useState({
    grand_revenue: 0,
    grand_tickets: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reportApi.getRevenueReport({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        filters: filters,
      });
      const items = response.data?.items || [];
      setData(items);
      setTotalRecords(response.data?.total || 0);

      const rev = items.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0);
      const tix = items.reduce((sum, item) => sum + (item.total_tickets_sold || 0), 0);
      setSummary({ grand_revenue: rev, grand_tickets: tix });

    } catch (error) {
      console.error("Error fetching revenue report:", error);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getExportParams = () => ({
    fileName: `Revenue_Report_${new Date().toISOString().split('T')[0]}`,
    reportTitle: 'Financial Revenue Summary by Event',
    data: data,
    columns: columns,
    summaryData: [
      { label: 'Grand Total Revenue', value: `$${summary.grand_revenue.toFixed(2)}` },
      { label: 'Total Tickets Sold', value: summary.grand_tickets }
    ]
  });

  const handleExcelExport = () => exportToExcel(getExportParams());
  const handleCSVExport = () => exportToCSV(getExportParams());

  const columns = [
    { field: "event__event_name", headerName: "Event Name", width: 300 },
    { 
      field: "total_revenue", 
      headerName: "Total Revenue", 
      width: 180,
      type: "number",
      valueFormatter: (value) => `$${parseFloat(value || 0).toFixed(2)}`,
    },
    { field: "total_tickets_sold", headerName: "Tickets Sold", width: 150, type: "number" },
    { field: "total_bookings", headerName: "Total Bookings", width: 150, type: "number" },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      {/* Grand Totals Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card elevation={3} sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <TrendingUpIcon fontSize="large" />
                <Box>
                  <Typography variant="overline">Grand Total Revenue (Current Page)</Typography>
                  <Typography variant="h4">${summary.grand_revenue.toFixed(2)}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card elevation={3} sx={{ bgcolor: "secondary.main", color: "secondary.contrastText" }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <ConfirmationNumberIcon fontSize="large" />
                <Box>
                  <Typography variant="overline">Total Tickets Sold (Current Page)</Typography>
                  <Typography variant="h4">{summary.grand_tickets}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 2, height: 500, border: '1px solid #eaeaea', borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
            Financial Revenue Summary by Event
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button 
              variant="contained" 
              color="success" 
              size="small" 
              startIcon={<FileDownloadIcon />} 
              onClick={handleExcelExport}
              sx={{ 
                borderRadius: 50, 
                px: 2, 
                textTransform: 'none', 
                fontWeight: 600,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                '&:hover': {
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s'
              }}
            >
              Excel
            </Button>
            <Button 
              variant="contained" 
              color="info" 
              size="small" 
              startIcon={<FileDownloadIcon />}
              onClick={handleCSVExport}
              sx={{ 
                borderRadius: 50, 
                px: 2, 
                textTransform: 'none', 
                fontWeight: 600,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                '&:hover': {
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s'
              }}
            >
              CSV
            </Button>
          </Stack>
        </Stack>
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.event_id}
          rowCount={totalRecords}
          loading={loading}
          paginationModel={paginationModel}
          paginationMode="server"
          onPaginationModelChange={setPaginationModel}
          onGridReady={() => {}}
          slots={{
            toolbar: GridToolbarContainer
          }}
          sx={{ border: 0 }}
        />
      </Paper>
    </Box>
  );
};

export default RevenueReport;
