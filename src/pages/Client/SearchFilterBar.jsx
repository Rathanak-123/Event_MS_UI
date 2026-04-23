import React from 'react';
import {
  Box,
  InputBase,
  Divider,
  Button,
  Stack,
  MenuItem,
  Select,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  InfoOutlined as StatusIcon,
} from '@mui/icons-material';

const selectSx = {
  fontSize: '0.9rem',
  fontWeight: 500,
  width: '100%',
  color: 'rgba(255,255,255,0.75)',
  '& .MuiSelect-select': { py: 0 },
  '&:before, &:after': { display: 'none' },
  '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' },
};

const menuItemSx = {
  fontSize: '0.9rem',
};

const SearchFilterBar = ({
  searchText,
  setSearchText,
  onSearch,
  venues = [],
  selectedVenue = 'all',
  setSelectedVenue,
  selectedDate = 'all',
  setSelectedDate,
  selectedStatus = 'active',
  setSelectedStatus,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        width: '100%',
        borderRadius: '16px',
        bgcolor: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        gap: isMobile ? 1.5 : 0,
        p: isMobile ? 2 : '8px 8px 8px 4px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Search Input */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flex: 2,
          px: 2,
          width: '100%',
        }}
      >
        <SearchIcon sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 20, mr: 1.2, flexShrink: 0 }} />
        <InputBase
          placeholder="Search for events, artists, or venues"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          sx={{
            flex: 1,
            fontSize: '0.92rem',
            fontWeight: 500,
            color: '#fff',
            '& input::placeholder': { color: 'rgba(255,255,255,0.45)' },
          }}
        />
      </Box>

      {!isMobile && (
        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 0.5, my: 1 }} />
      )}

      {/* Location */}
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, px: 2, width: '100%' }}>
        <LocationIcon sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 18, mr: 1.2, flexShrink: 0 }} />
        <Select
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
          variant="standard"
          disableUnderline
          sx={selectSx}
          MenuProps={{ PaperProps: { sx: { bgcolor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, color: '#fff' } } }}
        >
          <MenuItem value="all" sx={menuItemSx}>Anywhere</MenuItem>
          {venues.map((v) => (
            <MenuItem key={`venue-${v.id}`} value={v.id} sx={menuItemSx}>
              {v.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {!isMobile && (
        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 0.5, my: 1 }} />
      )}

      {/* Date */}
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, px: 2, width: '100%' }}>
        <CalendarIcon sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 18, mr: 1.2, flexShrink: 0 }} />
        <Select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          variant="standard"
          disableUnderline
          sx={selectSx}
          MenuProps={{ PaperProps: { sx: { bgcolor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, color: '#fff' } } }}
        >
          <MenuItem value="all" sx={menuItemSx}>Any Date</MenuItem>
          <MenuItem value="today" sx={menuItemSx}>Today</MenuItem>
          <MenuItem value="tomorrow" sx={menuItemSx}>Tomorrow</MenuItem>
          <MenuItem value="this-weekend" sx={menuItemSx}>This Weekend</MenuItem>
        </Select>
      </Box>

      {!isMobile && (
        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 0.5, my: 1 }} />
      )}

      {/* Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, px: 2, width: '100%' }}>
        <StatusIcon sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 18, mr: 1.2, flexShrink: 0 }} />
        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          variant="standard"
          disableUnderline
          sx={selectSx}
          MenuProps={{ PaperProps: { sx: { bgcolor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, color: '#fff' } } }}
        >
          <MenuItem value="active" sx={menuItemSx}>Active Only</MenuItem>
          <MenuItem value="all" sx={menuItemSx}>All Statuses</MenuItem>
          <MenuItem value="upcoming" sx={menuItemSx}>Upcoming</MenuItem>
          <MenuItem value="ongoing" sx={menuItemSx}>Ongoing</MenuItem>
          <MenuItem value="completed" sx={menuItemSx}>Completed</MenuItem>
          <MenuItem value="cancelled" sx={menuItemSx}>Cancelled</MenuItem>
        </Select>
      </Box>

      {/* Search Button */}
      <Button
        variant="contained"
        onClick={onSearch}
        sx={{
          bgcolor: '#0d9488',
          color: '#fff',
          borderRadius: '12px',
          px: isMobile ? 0 : 4,
          py: 1.5,
          height: isMobile ? 48 : 'auto',
          width: isMobile ? '100%' : 'auto',
          fontWeight: 700,
          fontSize: '0.95rem',
          flexShrink: 0,
          boxShadow: '0 4px 16px rgba(13, 148, 136, 0.4)',
          '&:hover': {
            bgcolor: '#0f766e',
            boxShadow: '0 6px 20px rgba(13, 148, 136, 0.5)',
          },
        }}
      >
        Search
      </Button>
    </Box>
  );
};

export default SearchFilterBar;
