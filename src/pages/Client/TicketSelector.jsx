import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  IconButton,
  Button,
  Divider,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ConfirmationNumber as TicketIcon
} from '@mui/icons-material';

const TicketSelector = ({ tickets = [], selectedTickets = {}, onQuantityChange }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
        <TicketIcon sx={{ mr: 1, color: 'primary.main' }} />
        Select Tickets
      </Typography>
      
      <Stack spacing={2}>
        {tickets.map((ticket) => {
          const quantity = selectedTickets[ticket.id] || 0;
          
          // Calculate true available quantity by subtracting sold tickets
          const totalQty = ticket.quantity ?? 100;
          const soldQty = ticket.sold ?? 0;
          const availableQty = ticket.available_quantity ?? Math.max(0, totalQty - soldQty);
          
          const isSoldOut = availableQty <= 0;

          return (
            <Paper
              key={ticket.id}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                borderColor: quantity > 0 ? 'primary.main' : 'divider',
                bgcolor: quantity > 0 ? alpha('#0f766e', 0.02) : 'background.paper',
                transition: 'all 0.2s ease'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {ticket.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ticket.description || 'General Admission'}
                  </Typography>
                  <Typography variant="h6" color="primary.main" sx={{ mt: 1, fontWeight: 800 }}>
                    ${Number(ticket.price).toFixed(2)}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  {isSoldOut ? (
                    <Typography color="error" variant="button" sx={{ fontWeight: 700 }}>
                      Sold Out
                    </Typography>
                  ) : (
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <IconButton 
                        size="small" 
                        onClick={() => onQuantityChange(ticket.id, Math.max(0, quantity - 1))}
                        disabled={quantity === 0}
                        sx={{ border: '1px solid', borderColor: 'divider' }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      
                      <Typography sx={{ minWidth: '24px', textAlign: 'center', fontWeight: 700 }}>
                        {quantity}
                      </Typography>
                      
                      <IconButton 
                        size="small" 
                        onClick={() => onQuantityChange(ticket.id, Math.min(availableQty, quantity + 1))}
                        disabled={quantity >= availableQty}
                        sx={{ border: '1px solid', borderColor: 'divider', color: 'primary.main' }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {availableQty} remaining {soldQty > 0 && `(${soldQty} sold)`}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

export default TicketSelector;
