import React, { useState, useEffect, useCallback } from "react";
import { Box, Paper, Typography, LinearProgress, Chip, Button, Stack, ButtonGroup } from "@mui/material";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import reportApi from "../../../api/report.api";
import { exportToExcel, exportToCSV } from "../../../utils/export";

const AttendanceReport = ({ filters }) => {
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reportApi.getAttendanceReport({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        filters: filters,
      });
      setData(response.data?.items || []);
      setTotalRecords(response.data?.total || 0);

    } catch (error) {
      console.error("Error fetching attendance report:", error);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getExportParams = () => ({
    fileName: `Attendance_Report_${new Date().toISOString().split('T')[0]}`,
    reportTitle: 'Event Participation & Attendance Analytics',
    data: data,
    columns: columns,
    summaryData: [
      { label: 'Total Events', value: data.length },
      { label: 'Avg Attendance Rate', value: `${(data.reduce((s, i) => s + (i.attendance_rate || 0), 0) / (data.length || 1)).toFixed(2)}%` }
    ]
  });

  const handleExcelExport = () => exportToExcel(getExportParams());
  const handleCSVExport = () => exportToCSV(getExportParams());

  const columns = [
    { field: "event_name", headerName: "Event Name", width: 250 },
    { field: "tickets_sold", headerName: "Tickets Sold", width: 150, type: "number" },
    { field: "tickets_checked_in", headerName: "Checked In", width: 150, type: "number" },
    { 
      field: "attendance_rate", 
      headerName: "Attendance Rate", 
      width: 250, 
      type: "number",
      renderCell: (params) => {
        const rate = params.value || 0;
        let color = "error";
        if (rate > 80) color = "success";
        else if (rate > 50) color = "warning";

        return (
          <Box sx={{ width: "100%", mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" value={rate} color={color} />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">{rate}%</Typography>
              </Box>
            </Box>
          </Box>
        );
      },
    },
  ];

  return (
    <Paper elevation={0} sx={{ p: 2, height: 600, border: '1px solid #eaeaea', borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
          Event Participation & Attendance Analytics
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
        getRowId={(row) => row.id}
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
  );
};

export default AttendanceReport;
