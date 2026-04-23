import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  Stack, 
  IconButton, 
  Divider,
  alpha
} from '@mui/material';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  LinkedIn,
  YouTube
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: '#060606', color: 'white', pt: 8, pb: 4, mt: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', color: '#fff' }}>V</Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>VeNTUI</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3, maxWidth: '300px' }}>
              The world's leading event booking platform, connecting millions of users with the most incredible experiences.
            </Typography>
            <Stack direction="row" spacing={1}>
              {[Facebook, Twitter, Instagram, LinkedIn, YouTube].map((Icon, index) => (
                <IconButton 
                    key={index} 
                    size="small" 
                    sx={{ color: 'white', '&:hover': { color: 'primary.main', bgcolor: 'rgba(255,255,255,0.05)' } }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Platform</Typography>
            <Stack spacing={1}>
              <Link href="#" color="inherit" underline="none" sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>Browse Events</Link>
              <Link href="#" color="inherit" underline="none" sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>Categories</Link>
              <Link href="#" color="inherit" underline="none" sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>Create Event</Link>
              <Link href="#" color="inherit" underline="none" sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>Pricing</Link>
            </Stack>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Support</Typography>
            <Stack spacing={1}>
              <Link href="#" color="inherit" underline="none" sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>Help Center</Link>
              <Link href="#" color="inherit" underline="none" sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>Terms of Service</Link>
              <Link href="#" color="inherit" underline="none" sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>Privacy Policy</Link>
              <Link href="#" color="inherit" underline="none" sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>Cookie Policy</Link>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Newsletter</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
              Subscribe to get the latest updates on events near you.
            </Typography>
            <Box sx={{ display: 'flex', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Box component="input" placeholder="Email address" sx={{ flexGrow: 1, border: 'none', bgcolor: 'transparent', color: 'white', px: 2, outline: 'none' }} />
                <Box component="button" sx={{ px: 3, py: 1.5, bgcolor: 'primary.main', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', '&:hover': { bgcolor: 'primary.dark' } }}>
                    Join
                </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            © {new Date().getFullYear()} VeNTUI. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
