import React from 'react';
import { 
  Box, 
  Chip, 
  Stack, 
  alpha,
  useTheme
} from '@mui/material';
import {
  MusicNote as MusicIcon,
  SportsBasketball as SportsIcon,
  Restaurant as FoodIcon,
  ArtTrack as ArtIcon,
  Theaters as TechIcon,
  DirectionsRun as FitnessIcon,
  BusinessCenter as CareerIcon,
  School as EducationIcon,
  Public as AllIcon
} from '@mui/icons-material';

const iconMap = {
  'Music': <MusicIcon fontSize="small" />,
  'Sports': <SportsIcon fontSize="small" />,
  'Food & Drink': <FoodIcon fontSize="small" />,
  'Arts': <ArtIcon fontSize="small" />,
  'Tech': <TechIcon fontSize="small" />,
  'Fitness': <FitnessIcon fontSize="small" />,
  'Networking': <CareerIcon fontSize="small" />,
  'Workshops': <EducationIcon fontSize="small" />,
  'Conference': <CareerIcon fontSize="small" />,
  'Comedy': <ArtIcon fontSize="small" />,
  'Meetup': <CareerIcon fontSize="small" />
};

const CategoryChips = ({ categories = [{ label: 'All', id: null }], selectedId = null, onSelect }) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%' }}>
      <Stack 
        direction="row" 
        spacing={1.5} 
        sx={{ 
          overflowX: 'auto', 
          pb: 2, 
          pt: 1,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none'
        }}
      >
        {categories.map((cat) => (
          <Chip
            key={cat.label}
            label={cat.label}
            icon={cat.label === 'All' ? null : (iconMap[cat.label] || iconMap[cat.category_name] || null)}
            onClick={() => onSelect(cat.id, cat.label)}
            sx={{
              px: 1,
              py: 2.5,
              borderRadius: '16px',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              border: '1.5px solid',
              borderColor: selectedId === cat.id ? 'primary.main' : 'divider',
              bgcolor: selectedId === cat.id ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              color: selectedId === cat.id ? 'primary.main' : 'text.secondary',
              '&:hover': {
                bgcolor: selectedId === cat.id ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.text.primary, 0.04),
                borderColor: 'primary.main',
                color: 'primary.main'
              },
              '& .MuiChip-icon': {
                color: selectedId === cat.id ? 'primary.main' : 'inherit',
              }
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default CategoryChips;
