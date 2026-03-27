import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
  IconButton,
  Grid,
  Divider,
  Avatar,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { getCustomerById } from "../../../api/customer.api";

import { getAvatarUrl } from "../../../utils/imageUtils";


export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const data = await getCustomerById(id);
      if (data) {
        setCustomer(data);
      } else {
        navigate("/admin/customer");
      }
    } catch (error) {
      console.error("Failed to fetch customer detail:", error);
      navigate("/admin/customer");
    } finally {
      setLoading(false);
    }
  };



  const handleClose = () => {
    navigate("/admin/customer");
  };

  return (
    <Dialog open onClose={handleClose} fullWidth maxWidth="md">
      <Box
        sx={{
          px: 4,
          pt: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Typography variant="h5" fontWeight="bold">
          CUSTOMER DETAILS
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 4, pb: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress />
          </Box>
        ) : customer ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderRadius: 4,
                  bgcolor: "#f8f9fa",
                  border: "1px solid #eee",
                }}>
                <Avatar
                  src={getAvatarUrl(customer.picture, customer)}

                  alt={customer.first_name}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    mb: 2,
                    border: "4px solid white",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                  }}
                />
                <Typography variant="h6" fontWeight="bold">
                  {customer.first_name} {customer.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ID: #{customer.id}
                </Typography>
                <Chip
                  label={customer.status ? "Active" : "Inactive"}
                  color={customer.status ? "success" : "default"}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Full Name
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {customer.first_name} {customer.last_name}
                  </Typography>
                </Box>

                <Divider />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <EmailIcon color="action" fontSize="small" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Email Address
                        </Typography>
                        <Typography variant="body1">{customer.email || "—"}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <VerifiedUserIcon color="action" fontSize="small" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Role
                        </Typography>
                        <Typography variant="body1">
                          {customer.role?.display_name || customer.role?.name || "Customer"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <CalendarTodayIcon color="action" fontSize="small" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Created At
                        </Typography>
                        <Typography variant="body2">
                          {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : "—"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <CalendarTodayIcon color="action" fontSize="small" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Last Updated
                        </Typography>
                        <Typography variant="body2">
                          {customer.updated_at ? new Date(customer.updated_at).toLocaleDateString() : "—"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: customer.email_verified ? "#f0fff4" : "#fff5f5",
                    border: "1px solid",
                    borderColor: customer.email_verified ? "#c6f6d5" : "#fed7d7",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}>
                  <Typography variant="body2" color={customer.email_verified ? "success.dark" : "error.dark"}>
                    {customer.email_verified ? "✓ Email is verified" : "⚠ Email is not verified"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        ) : (
          <Typography color="error">Customer not found</Typography>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 4, py: 2.5 }}>
        <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>
          Close
        </Button>
        <Button
          onClick={() => navigate(`/admin/customer/edit/${id}`)}
          variant="contained"
          startIcon={<EditIcon />}
          sx={{ borderRadius: 2, px: 3 }}>
          Edit Customer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
