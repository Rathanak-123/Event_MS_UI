import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Button,
  ButtonGroup,
} from "@mui/material";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import reportApi from "../../../api/report.api";
import { exportToExcel, exportToCSV } from "../../../utils/export";

const PaymentMethodReport = ({ filters }) => {
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [totalAmount, setTotalAmount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reportApi.getPaymentMethodReport({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        filters: filters,
      });
      const items = response.data?.items || [];
      setData(items);
      setTotalRecords(response.data?.total || 0);

      const totalValue = items.reduce(
        (sum, item) => sum + parseFloat(item.total_collected || 0),
        0,
      );
      setTotalAmount(totalValue);
    } catch (error) {
      console.error("Error fetching payment method report:", error);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getExportParams = () => ({
    fileName: `Payment_Method_Report_${new Date().toISOString().split("T")[0]}`,
    reportTitle: "Transaction Breakdown by Payment Method",
    data: data,
    columns: columns,
    summaryData: [
      {
        label: "Total Amount Collected",
        value: `$${totalAmount.toFixed(2)}`,
      },
    ],
  });

  const handleExcelExport = () => exportToExcel(getExportParams());
  const handleCSVExport = () => exportToCSV(getExportParams());

  const columns = [
    { field: "payment_method", headerName: "Method", width: 250 },
    {
      field: "transaction_count",
      headerName: "Transaction Count",
      width: 200,
      type: "number",
    },
    {
      field: "total_collected",
      headerName: "Total Amount Collected",
      width: 250,
      type: "number",
      valueFormatter: (value) => `$${parseFloat(value || 0).toFixed(2)}`,
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      {/* Grand Total Card */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card
            elevation={3}
            sx={{ bgcolor: "success.main", color: "success.contrastText" }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <AccountBalanceWalletIcon fontSize="large" />
                <Box>
                  <Typography variant="overline">
                    Total Collected (Current Page)
                  </Typography>
                  <Typography variant="h4">
                    ${totalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{ p: 2, height: 400, border: "1px solid #eaeaea", borderRadius: 3 }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            Transaction Breakdown by Payment Method
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
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                "&:hover": {
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s",
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
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                "&:hover": {
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s",
              }}
            >
              CSV
            </Button>
          </Stack>
        </Stack>
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.payment_method}
          rowCount={totalRecords}
          loading={loading}
          paginationModel={paginationModel}
          paginationMode="server"
          onPaginationModelChange={setPaginationModel}
          onGridReady={() => {}}
          slots={{
            toolbar: GridToolbarContainer,
          }}
          sx={{ border: 0 }}
        />
      </Paper>
    </Box>
  );
};

export default PaymentMethodReport;
