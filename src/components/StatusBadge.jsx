import React from "react";
import { Chip } from "@mui/material";
import { 
  AccessTime as UpcomingIcon, 
  PlayCircleOutline as OngoingIcon, 
  CheckCircleOutline as CompletedIcon, 
  CancelOutlined as CancelledIcon 
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "upcoming":
        return {
          label: t("event_list.upcoming"),
          color: "info", // Blue
          icon: <UpcomingIcon sx={{ fontSize: "16px !important" }} />,
          sx: {
            bgcolor: "rgba(2, 132, 199, 0.1)",
            color: "#0284c7",
            border: "1px solid rgba(2, 132, 199, 0.2)",
          },
        };
      case "ongoing":
        return {
          label: t("event_list.ongoing"),
          color: "success", // Green
          icon: <OngoingIcon sx={{ fontSize: "16px !important" }} />,
          sx: {
            bgcolor: "rgba(22, 163, 74, 0.1)",
            color: "#16a34a",
            border: "1px solid rgba(22, 163, 74, 0.2)",
          },
        };
      case "completed":
        return {
          label: t("event_list.completed"),
          color: "default", // Gray
          icon: <CompletedIcon sx={{ fontSize: "16px !important" }} />,
          sx: {
            bgcolor: "rgba(100, 116, 139, 0.1)",
            color: "#64748b",
            border: "1px solid rgba(100, 116, 139, 0.2)",
          },
        };
      case "cancelled":
        return {
          label: t("event_list.cancelled"),
          color: "error", // Red
          icon: <CancelledIcon sx={{ fontSize: "16px !important" }} />,
          sx: {
            bgcolor: "rgba(220, 38, 38, 0.1)",
            color: "#dc2626",
            border: "1px solid rgba(220, 38, 38, 0.2)",
          },
        };
      default:
        return {
          label: status || "Unknown",
          color: "default",
          icon: null,
          sx: {},
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      label={config.label}
      size="small"
      icon={config.icon}
      sx={{
        fontWeight: 600,
        fontSize: "0.75rem",
        height: "24px",
        borderRadius: "6px",
        "& .MuiChip-icon": {
          color: "inherit",
        },
        ...config.sx,
      }}
    />
  );
};

export default StatusBadge;
