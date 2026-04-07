import React, { useState, useEffect, useCallback } from "react";
import { Box, Paper, Typography, Button, Stack, ButtonGroup } from "@mui/material";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import reportApi from "../../../api/report.api";
import { exportToExcel, exportToCSV } from "../../../utils/export";
import dayjs from "dayjs";

const BookingReport = ({ filters }) => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reportApi.getBookingReport({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        filters: filters,
      });
      setData(response.data?.items || []);
      setTotal(response.data?.total || 0);
    } catch (error) {
      console.error("Error fetching booking report:", error);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getExportParams = () => ({
    fileName: `Booking_Report_${dayjs().format('YYYY-MM-DD')}`,
    reportTitle: 'Detailed Booking & Sales Ledger',
    data: data,
    columns: columns,
    summaryData: [
      { label: 'Total Records', value: data.length },
      { label: 'Sum Qty', value: data.reduce((s, i) => s + (i.quantity || 0), 0) },
      { label: 'Sum Revenue', value: `$${data.reduce((s, i) => s + parseFloat(i.total_amount || 0), 0).toFixed(2)}` }
    ]
  });

  const handleExcelExport = () => exportToExcel(getExportParams());
  const handleCSVExport = () => exportToCSV(getExportParams());

  const columns = [
    { 
      field: "booking_date", 
      headerName: "Date", 
      width: 160,
      valueFormatter: (value) => dayjs(value).format("YYYY-MM-DD HH:mm"),
    },
    { 
      field: "customer", 
      headerName: "Customer", 
      width: 200,
      valueGetter: (value, row) => row.customer?.full_name || "N/A",
    },
    { 
      field: "event", 
      headerName: "Event", 
      width: 200,
      valueGetter: (value, row) => row.event?.name || "N/A",
    },
    { 
      field: "ticket", 
      headerName: "Ticket Type", 
      width: 150,
      valueGetter: (value, row) => row.ticket?.type || "N/A",
    },
    { field: "quantity", headerName: "Qty", width: 80, type: "number" },
    { 
      field: "total_amount", 
      headerName: "Total Amount", 
      width: 130, 
      type: "number",
      valueFormatter: (value) => `$${parseFloat(value || 0).toFixed(2)}`,
    },
    { field: "status", headerName: "Status", width: 120 },
  ];

  return (
    <Paper elevation={0} sx={{ p: 2, height: 650, width: "100%", border: '1px solid #eaeaea', borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
          Detailed Booking & Sales Ledger
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
        getRowId={(row) => row.booking_id}
        rowCount={total}
        loading={loading}
        pageSizeOptions={[5, 10, 20]}
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
  );
};

export default BookingReport;
