import React from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Divider,
  Box,
  Button,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

const SearchFilterBar = ({ 
  searchText, 
  setSearchText, 
  onSearch,
  venues = [],
  selectedVenue = 'all',
  setSelectedVenue,
  selectedDate = 'all',
  setSelectedDate
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Paper
      elevation={0}
      sx={{
        p: isMobile ? 2 : 1,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        width: '100%',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        gap: isMobile ? 2 : 0,
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
      }}
    >
      {/* Search Input */}
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 2, px: 1, width: '100%' }}>
        <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
        <InputBase
          placeholder="Search for event name, artist, or team"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          sx={{ ml: 1, flex: 1, fontSize: '0.95rem', fontWeight: 500 }}
        />
      </Box>

      {!isMobile && <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />}

      {/* Location Input */}
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, px: 1, width: '100%' }}>
        <LocationIcon sx={{ color: 'text.secondary', mr: 1 }} />
        <Select
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
          variant="standard"
          disableUnderline
          sx={{ 
            fontSize: '0.9rem', 
            fontWeight: 500, 
            width: '100%',
            '& .MuiSelect-select': { py: 0 }
          }}
        >
          <MenuItem key="venue-all" value="all">Everywhere</MenuItem>
          {venues.map((venue) => (
            <MenuItem key={`venue-${venue.id}`} value={venue.id}>
              {venue.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {!isMobile && <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />}

      {/* Date Input */}
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, px: 1, width: '100%' }}>
        <CalendarIcon sx={{ color: 'text.secondary', mr: 1 }} />
        <Select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          variant="standard"
          disableUnderline
          sx={{ 
            fontSize: '0.9rem', 
            fontWeight: 500, 
            width: '100%',
            '& .MuiSelect-select': { py: 0 }
          }}
        >
          <MenuItem key="date-all" value="all">Any Date</MenuItem>
          <MenuItem key="date-today" value="today">Today</MenuItem>
          <MenuItem key="date-tomorrow" value="tomorrow">Tomorrow</MenuItem>
          <MenuItem key="date-weekend" value="this-weekend">This Weekend</MenuItem>
        </Select>
      </Box>

      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={onSearch}
        sx={{
          borderRadius: 3,
          px: 4,
          height: isMobile ? '48px' : '52px',
          width: isMobile ? '100%' : 'auto',
          boxShadow: '0 6px 20px rgba(0, 105, 92, 0.25)'
        }}
      >
        Search
      </Button>
    </Paper>
  );
};

export default SearchFilterBar;
