import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Stack,
  alpha,
  useTheme,
  Skeleton,
  Alert,
  Paper
} from '@mui/material';
import SearchFilterBar from './SearchFilterBar';
import CategoryChips from './CategoryChips';
import EventCard from './EventCard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getPaginatedEvents } from '../../api/events.api';
import { getAllCategories } from '../../api/category.api';
import { getAllVenues } from '../../api/venue.api';
import { extractErrorMessage } from '../../utils/errorHandler';


import { getImageUrl } from '../../utils/imageUtils';

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([{ label: 'All', id: null }]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState('All');
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [searchText, setSearchText] = useState('');
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories and venues
      const [catData, venueData] = await Promise.all([
        getAllCategories(),
        getAllVenues()
      ]);

      const formattedCats = [
        { label: 'All', id: null },
        ...catData.map(c => ({ label: c.category_name || c.name, id: c.id }))
      ];
      setCategories(formattedCats);
      setVenues(venueData || []);

      // Fetch events
      const eventParams = {
        limit: 12,
        search: searchText,
        filters: {}
      };

      if (selectedCategoryId) {
        eventParams.filters.category_id = selectedCategoryId;
      }
      if (selectedVenue !== 'all') {
        eventParams.filters.venue_id = selectedVenue;
      }
      
      const data = await getPaginatedEvents(eventParams);
      // Support multiple response structures
      const items = data?.items || data?.results || data?.data || (Array.isArray(data) ? data : []);
      setEvents(items);
    } catch (err) {
      console.error(err);
      setError(extractErrorMessage(err));

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategoryId, selectedVenue, selectedDate]);

  const handleSearch = () => {
    fetchData();
  };

  const handleCategorySelect = (id, label) => {
    setSelectedCategoryId(id);
    setSelectedCategoryLabel(label);
  };

  const renderEventGrid = (items, isLoading) => {
    if (isLoading) {
      return (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${i}`}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 4, mb: 1 }} />
              <Skeleton width="80%" sx={{ mb: 1 }} />
              <Skeleton width="60%" />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (!items || items.length === 0) {
      return (
        <Box sx={{ py: 10, textAlign: 'center', bgcolor: alpha(theme.palette.text.primary, 0.02), borderRadius: 6, border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="h6" color="text.secondary">No events found matching your criteria.</Typography>
          <Button sx={{ mt: 2 }} onClick={() => { setSelectedCategoryId(null); setSelectedCategoryLabel('All'); setSearchText(''); setSelectedVenue('all'); setSelectedDate('all'); fetchData(); }}>Clear Filters</Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {items.map((event) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
            <EventCard 
                event={{
                    id: event.id,
                    title: event.event_name || event.title || event.name,
                    date: event.event_date || new Date(event.start_date || event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    location: event.venue?.name || event.venue_name || "Location TBD",
                    price: event.price > 0 ? `$${event.price}` : "Free",
                    category: event.category?.category_name || event.category_name || "General",
                    image: event.image

                }} 
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      
      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative', 
          pt: { xs: 12, md: 20 },
          pb: { xs: 8, md: 15 },
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        {/* Background Decorative Elements */}
        <Box sx={{ 
            position: 'absolute', 
            top: -200, 
            right: -100, 
            width: 800, 
            height: 800, 
            borderRadius: '50%', 
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
            zIndex: 0
        }} />
        <Box sx={{ 
            position: 'absolute', 
            bottom: -150, 
            left: -100, 
            width: 600, 
            height: 600, 
            borderRadius: '50%', 
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 70%)`,
            zIndex: 0
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ maxWidth: '850px', mb: 8, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography 
              variant="h1" 
              sx={{ 
                  fontSize: { xs: '3.2rem', md: '5rem' }, 
                  fontWeight: 900, 
                  mb: 3,
                  lineHeight: 0.95,
                  letterSpacing: '-3px',
                  color: 'text.primary'
              }}
            >
              Discover Your Next <br />
              <Box component="span" sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>Extraordinary</Box> Event
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                  mb: 5, 
                  fontWeight: 500, 
                  color: 'text.secondary',
                  maxWidth: '600px',
                  mx: { xs: 'auto', md: 0 },
                  fontSize: '1.25rem',
                  lineHeight: 1.6,
                  opacity: 0.9
              }}
            >
              The premium platform for booking tickets to exclusive concerts, high-stakes sports, and inspiring workshops. Experience the extraordinary.
            </Typography>
          </Box>
          
          <Box sx={{ mt: 2, maxWidth: '1000px' }}>
            <SearchFilterBar 
                searchText={searchText} 
                setSearchText={setSearchText} 
                onSearch={handleSearch}
                venues={venues}
                selectedVenue={selectedVenue}
                setSelectedVenue={setSelectedVenue}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
            />
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>{error}</Alert>}

        {/* Category Filters */}
        <Box sx={{ mb: 8 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>Explore by Category</Typography>
          </Stack>
          <CategoryChips 
            categories={categories}
            selectedId={selectedCategoryId} 
            onSelect={handleCategorySelect} 
          />
        </Box>

        {/* Event Grid Section */}
        <Box sx={{ mb: 10 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 6 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-2px' }}>
                {selectedCategoryLabel === 'All' ? 'Upcoming Experiences' : `${selectedCategoryLabel} Events`}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>Hand-picked events matching your unique taste</Typography>
            </Box>
            <Button 
                endIcon={<ArrowForwardIcon />} 
                variant="text"
                sx={{ fontWeight: 800, fontSize: '1rem', color: 'primary.main' }}
            >
                View All
            </Button>
          </Stack>
          
          {renderEventGrid(events, loading)}
        </Box>

      </Container>
    </Box>
  );
};

export default HomePage;
