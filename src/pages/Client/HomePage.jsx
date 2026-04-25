import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Stack,
  Skeleton,
  Alert,
} from '@mui/material';
import SearchFilterBar from './SearchFilterBar';
import CategoryChips from './CategoryChips';
import EventCard from './EventCard';
import { getPaginatedEvents } from '../../api/events.api';
import { getAllCategories } from '../../api/category.api';
import { getAllVenues } from '../../api/venue.api';
import { extractErrorMessage } from '../../utils/errorHandler';
import heroConcert from '../../assets/hero_concert.png';

const HomePage = () => {
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
  const [selectedStatus, setSelectedStatus] = useState('active'); // Default to active events
  const [searchText, setSearchText] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catData, venueData] = await Promise.all([
        getAllCategories(),
        getAllVenues(),
      ]);

      const formattedCats = [
        { label: 'All', id: null },
        ...catData.map((c) => ({ label: c.category_name || c.name, id: c.id })),
      ];
      setCategories(formattedCats);
      setVenues(venueData || []);

      const eventParams = {
        limit: 12,
        search: searchText,
        filters: {},
      };
      if (selectedCategoryId) eventParams.filters.category_id = selectedCategoryId;
      if (selectedVenue !== 'all') eventParams.filters.venue_id = selectedVenue;
      
      // Filter status: 'active' means upcoming or ongoing. 
      // If backend doesn't support multiple, we might need to handle it or just pick one.
      // Assuming backend might need a specific string or we just filter for active by default.
      if (selectedStatus === 'active') {
        // If the backend doesn't support array, this might only filter one. 
        // For now, let's assume we can pass 'upcoming' as a safe default for 'active' 
        // or just let it be if the user wants to see all.
        eventParams.filters.status = 'upcoming'; 
      } else if (selectedStatus !== 'all') {
        eventParams.filters.status = selectedStatus;
      }

      const data = await getPaginatedEvents(eventParams);
      let items =
        data?.items || data?.results || data?.data || (Array.isArray(data) ? data : []);

      // Time-Aware Sort: Upcoming (Future) > Ongoing > Completed (Past)
      const now = new Date().getTime();
      const statusWeight = { upcoming: 1, ongoing: 2, completed: 3 };

      items = [...items].sort((a, b) => {
        const dateA = new Date(a.event_date || a.start_date || 0).getTime();
        const dateB = new Date(b.event_date || b.start_date || 0).getTime();
        const statusA = (a.status || '').toLowerCase();
        const statusB = (b.status || '').toLowerCase();

        const getWeight = (status, date) => {
          if (statusWeight[status]) return statusWeight[status];
          if (date > now) return 1;
          return 3;
        };

        const weightA = getWeight(statusA, dateA);
        const weightB = getWeight(statusB, dateB);

        if (weightA !== weightB) return weightA - weightB;
        if (weightA === 1) return dateA - dateB; // Upcoming: Closest first
        return dateB - dateA; // Past: Most recent first
      });

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
  }, [selectedCategoryId, selectedVenue, selectedDate, selectedStatus]);

  const handleSearch = () => fetchData();

  const handleCategorySelect = (id, label) => {
    setSelectedCategoryId(id);
    setSelectedCategoryLabel(label);
  };

  const renderEventGrid = (items, isLoading) => {
    if (isLoading) {
      return (
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${i}`}>
              <Skeleton
                variant="rectangular"
                height={280}
                sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.06)' }}
              />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (!items || items.length === 0) {
      return (
        <Box
          sx={{
            py: 10,
            textAlign: 'center',
            bgcolor: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            border: '1px dashed rgba(255,255,255,0.12)',
          }}
        >
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            No events found matching your criteria.
          </Typography>
          <Button
            sx={{ mt: 2, color: '#2dd4bf', borderColor: '#2dd4bf' }}
            variant="outlined"
            onClick={() => {
              setSelectedCategoryId(null);
              setSelectedCategoryLabel('All');
              setSearchText('');
              setSelectedVenue('all');
              setSelectedDate('all');
              setSelectedStatus('active');
              fetchData();
            }}
          >
            Clear Filters
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={2.5}>
        {items.map((event) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
            <EventCard event={event} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      {/* ─────────────── HERO ─────────────── */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '75vh', md: '85vh' },
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
        }}
      >
        {/* Background image */}
        <Box
          component="img"
          src={heroConcert}
          alt="Concert hero"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
          }}
        />

        {/* Dark gradient overlays */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.55) 55%, rgba(10,10,10,0.97) 100%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to right, rgba(10,10,10,0.4) 0%, transparent 60%)',
          }}
        />

        {/* Hero Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pb: { xs: 7, md: 10 }, pt: 14 }}>
          <Box sx={{ maxWidth: 560 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.6rem', md: '4rem' },
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-2px',
                color: '#fff',
                mb: 2,
              }}
            >
              What's Playing Soon
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '1.05rem',
                mb: 5,
                lineHeight: 1.65,
                maxWidth: 420,
              }}
            >
              Find the perfect show to experience your favorite music live.
            </Typography>
          </Box>

          {/* Search bar embedded in hero */}
          <Box sx={{ maxWidth: 860 }}>
            <SearchFilterBar
              searchText={searchText}
              setSearchText={setSearchText}
              onSearch={handleSearch}
              venues={venues}
              selectedVenue={selectedVenue}
              setSelectedVenue={setSelectedVenue}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            />
          </Box>
        </Container>
      </Box>

      {/* ─────────────── EVENTS SECTION ─────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2, bgcolor: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}>
            {error}
          </Alert>
        )}

        {/* Section Header */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.2} sx={{ mb: 1.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
            <Typography
              sx={{
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: 'rgba(255,255,255,0.55)',
                textTransform: 'uppercase',
              }}
            >
              All Events
            </Typography>
          </Stack>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.9rem', md: '2.6rem' },
              letterSpacing: '-1.5px',
              color: '#fff',
            }}
          >
            Discover Every Event{' '}
            <Box component="span" sx={{ color: '#ef4444' }}>
              Happening Soon
            </Box>
          </Typography>
        </Box>

        {/* Category Chips */}
        <Box sx={{ mb: 5 }}>
          <CategoryChips
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={handleCategorySelect}
          />
        </Box>

        {/* Event Grid */}
        {renderEventGrid(events, loading)}

      
      </Container>
    </Box>
  );
};

export default HomePage;
