import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  IconButton,
  alpha,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ConfirmationNumber as TicketIcon,
  PersonOutline as PersonIcon,
  StarOutline as StarIcon,
} from '@mui/icons-material';

const TicketSelector = ({ tickets = [], selectedTickets = {}, onQuantityChange }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, display: 'flex', alignItems: 'center', color: '#fff' }}>
        <Box sx={{ width: 24, height: 24, bgcolor: '#0d9488', borderRadius: 1, mr: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TicketIcon sx={{ fontSize: 14, color: '#fff' }} />
        </Box>
        Select Tickets
      </Typography>
      
      <Stack spacing={2.5}>
        {tickets.map((ticket, index) => {
          const quantity = selectedTickets[ticket.id] || 0;
          
          const totalQty = ticket.quantity ?? 1000;
          const soldQty = ticket.sold ?? 0;
          const availableQty = ticket.available_quantity ?? Math.max(0, totalQty - soldQty);
          const isSoldOut = availableQty <= 0;

          // Alternate icons for visual variety like the screenshot
          const Icon = index % 2 === 0 ? PersonIcon : StarIcon;
          const iconColor = index % 2 === 0 ? '#2dd4bf' : '#fbbf24';

          return (
            <Paper
              key={ticket.id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: quantity > 0 ? '#2dd4bf' : 'rgba(255,255,255,0.06)',
                bgcolor: 'rgba(255,255,255,0.02)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.04)',
                  borderColor: quantity > 0 ? '#2dd4bf' : 'rgba(255,255,255,0.12)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                {/* Icon Avatar */}
                <Avatar 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    bgcolor: 'rgba(255,255,255,0.05)', 
                    color: iconColor,
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <Icon />
                </Avatar>

                {/* Details */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', fontSize: '1rem', mb: 0.2 }}>
                    {ticket.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', display: 'block', mb: 0.5 }}>
                    {ticket.description || 'Access to main event area'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <PersonIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                      {availableQty} remaining
                    </Typography>
                  </Box>
                </Box>

                {/* Price */}
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#2dd4bf', minWidth: 80, textAlign: 'right' }}>
                  ${Number(ticket.price).toFixed(2)}
                </Typography>

                {/* Controls */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  {isSoldOut ? (
                    <Typography sx={{ color: '#ef4444', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Sold Out
                    </Typography>
                  ) : (
                    <Stack 
                      direction="row" 
                      alignItems="center" 
                      sx={{ 
                        bgcolor: 'rgba(0,0,0,0.3)', 
                        borderRadius: '12px', 
                        p: 0.5,
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      <IconButton 
                        size="small" 
                        onClick={() => onQuantityChange(ticket.id, Math.max(0, quantity - 1))}
                        disabled={quantity === 0}
                        sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff' } }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      
                      <Typography sx={{ minWidth: '32px', textAlign: 'center', fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>
                        {quantity}
                      </Typography>
                      
                      <IconButton 
                        size="small" 
                        onClick={() => onQuantityChange(ticket.id, Math.min(availableQty, quantity + 1))}
                        disabled={quantity >= availableQty}
                        sx={{ color: '#fff', '&:hover': { color: '#2dd4bf' } }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  )}
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 600 }}>
                    {soldQty} sold
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
