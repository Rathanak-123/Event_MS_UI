import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import {
  MusicNote as MusicIcon,
  SportsBasketball as SportsIcon,
  Restaurant as FoodIcon,
  ArtTrack as ArtIcon,
  Theaters as TechIcon,
  DirectionsRun as FitnessIcon,
  BusinessCenter as CareerIcon,
  School as EducationIcon,
  Apps as AllIcon,
  ExpandMore as MoreIcon,
} from '@mui/icons-material';

const iconMap = {
  Music: <MusicIcon sx={{ fontSize: '0.95rem' }} />,
  Sports: <SportsIcon sx={{ fontSize: '0.95rem' }} />,
  'Food & Drink': <FoodIcon sx={{ fontSize: '0.95rem' }} />,
  Arts: <ArtIcon sx={{ fontSize: '0.95rem' }} />,
  Art: <ArtIcon sx={{ fontSize: '0.95rem' }} />,
  Tech: <TechIcon sx={{ fontSize: '0.95rem' }} />,
  Fitness: <FitnessIcon sx={{ fontSize: '0.95rem' }} />,
  Networking: <CareerIcon sx={{ fontSize: '0.95rem' }} />,
  Workshops: <EducationIcon sx={{ fontSize: '0.95rem' }} />,
  Conference: <CareerIcon sx={{ fontSize: '0.95rem' }} />,
  Comedy: <ArtIcon sx={{ fontSize: '0.95rem' }} />,
  Meetup: <CareerIcon sx={{ fontSize: '0.95rem' }} />,
};

const CategoryChips = ({ categories = [{ label: 'All', id: null }], selectedId = null, onSelect }) => {
  // Show first 7 + "More" button
  const primary = categories.slice(0, 8);

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
      <Stack direction="row" spacing={1} sx={{ pb: 1, minWidth: 'max-content' }}>
        {primary.map((cat) => {
          const isSelected = selectedId === cat.id;
          const icon = cat.label === 'All' ? null : (iconMap[cat.label] || iconMap[cat.category_name] || null);
          return (
            <Box
              key={cat.id ?? cat.label}
              onClick={() => onSelect(cat.id, cat.label)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.7,
                px: 1.8,
                py: 0.85,
                borderRadius: '50px',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: isSelected ? 'transparent' : 'rgba(255,255,255,0.15)',
                bgcolor: isSelected
                  ? cat.label === 'All'
                    ? 'rgba(255,255,255,0.92)'
                    : 'rgba(255,255,255,0.12)'
                  : 'transparent',
                color: isSelected
                  ? cat.label === 'All'
                    ? '#000'
                    : '#fff'
                  : 'rgba(255,255,255,0.65)',
                transition: 'all 0.22s ease',
                userSelect: 'none',
                '&:hover': {
                  bgcolor: isSelected
                    ? cat.label === 'All'
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(255,255,255,0.18)'
                    : 'rgba(255,255,255,0.08)',
                  color: cat.label === 'All' && isSelected ? '#000' : '#fff',
                  borderColor: 'rgba(255,255,255,0.25)',
                },
              }}
            >
              {icon && (
                <Box
                  sx={{
                    display: 'flex',
                    color: 'inherit',
                    opacity: 0.85,
                  }}
                >
                  {icon}
                </Box>
              )}
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: isSelected ? 700 : 500,
                  lineHeight: 1,
                  color: 'inherit',
                }}
              >
                {cat.label}
              </Typography>
            </Box>
          );
        })}

        {/* More button */}
        {categories.length > 8 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.8,
              py: 0.85,
              borderRadius: '50px',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.65)',
              transition: 'all 0.22s ease',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.08)',
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.25)',
              },
            }}
          >
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, lineHeight: 1 }}>More</Typography>
            <MoreIcon sx={{ fontSize: '1rem' }} />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default CategoryChips;
