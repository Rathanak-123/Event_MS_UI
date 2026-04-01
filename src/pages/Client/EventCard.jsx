import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  CardMedia, 
  CardContent, 
  Button,
  Stack
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import StarIcon from '@mui/icons-material/Star';
import { getImageUrl } from "../../utils/imageUtils";
import { getPaginatedTickets } from "../../api/ticket.api";

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { 
    id,
    event_name,
    event_date,
    venue,
    image = ""
  } = event || {};

  const propTickets = event?.tickets;
  const [tickets, setTickets] = useState(propTickets || []);
  const [loadingPrice, setLoadingPrice] = useState(false);

  useEffect(() => {
    if ((!propTickets || propTickets.length === 0) && id) {
      if (tickets.length > 0) return;
      const fetchTickets = async () => {
        setLoadingPrice(true);
        try {
          const data = await getPaginatedTickets({ filters: { event_id: id }, limit: 20 });
          const items = data?.items || data?.results || data?.data || (Array.isArray(data) ? data : []);
          setTickets(items);
        } catch (err) {
          console.error("Failed to fetch tickets for event:", id, err);
          if (tickets.length === 0) setTickets([]);
        } finally {
          setLoadingPrice(false);
        }
      };
      fetchTickets();
    } else if (propTickets && propTickets.length > 0) {
      setTickets(propTickets);
    }
  }, [id, propTickets]);

  const title = event_name || event.title || event.name || "Unnamed Event";
  
  const formatDate = () => {
    const rawDate = event_date || event.start_date || event.date;
    if (!rawDate) return "Date TBA";
    try {
      return new Date(rawDate).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return rawDate;
    }
  };
  const date = formatDate();

  const location = venue?.name || event.venue_name || event.location || "Venue TBA";

  const getDisplayPrice = () => {
    if (tickets && tickets.length > 0) {
      const validPrices = tickets.map(t => Number(t.price)).filter(p => !isNaN(p));
      if (validPrices.length > 0) {
        const minPrice = Math.min(...validPrices);
        return minPrice > 0 ? `$${minPrice}` : 'Free';
      }
    }
    const p = event.price ?? event.starting_price ?? event.min_price ?? event.base_price ?? event.propPrice;
    if (p !== undefined && p !== null && p !== "") {
      const numP = Number(p);
      if (!isNaN(numP)) return numP > 0 ? `$${numP}` : 'Free';
      return p;
    }
    return "Check Tickets";
  };

  const price = getDisplayPrice();

  return (
    <Card 
      elevation={0}
      onClick={() => navigate(`/event/${id}`)}
      sx={{ 
        height: "100%",
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid #f0f0f0",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        bgcolor: "#fff",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          borderColor: "transparent"
        }
      }}
    >
      <Box sx={{ position: "relative", paddingTop: "66.67%" /* 3:2 Aspect Ratio */ }}>
        <CardMedia
          component="img"
          image={getImageUrl(image)}
          alt={title}
          sx={{ 
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      </Box>

      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        {/* Title and Rating */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              fontSize: "1.2rem",
              lineHeight: 1.25,
              color: "#111",
              flex: 1,
              pr: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}
          >
            {title}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
            <StarIcon sx={{ color: "#FFC107", fontSize: "1.2rem" }} />
            <Typography sx={{ fontWeight: 600, fontSize: "1rem", color: "#111" }}>
              4.8
            </Typography>
          </Stack>
        </Stack>

        {/* Details: Location and Date */}
        <Stack spacing={1.2} sx={{ mb: 3.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.2} sx={{ color: "#666" }}>
            <LocationOnOutlinedIcon sx={{ fontSize: "1.2rem" }} />
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: "0.95rem", 
                fontWeight: 500,
                whiteSpace: "nowrap", 
                overflow: "hidden", 
                textOverflow: "ellipsis" 
              }}
            >
              {location}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.2} sx={{ color: "#666" }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: "1.1rem", ml: 0.1 }} />
            <Typography variant="body2" sx={{ fontSize: "0.95rem", fontWeight: 500 }}>
              {date}
            </Typography>
          </Stack>
        </Stack>

        {/* Footer: Price and Button */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 800, 
              color: "#000",
              fontSize: "1.4rem",
              letterSpacing: "-0.5px"
            }}
          >
            {price}
          </Typography>
          <Button 
            variant="contained" 
            disableElevation
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/event/${id}`);
            }}
            sx={{ 
              bgcolor: "#000", 
              color: "#fff",
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 700,
              px: 3,
              py: 1.1,
              "&:hover": {
                bgcolor: "#222"
              }
            }}
          >
            View Details
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default EventCard;
