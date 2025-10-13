import { useState } from "react";
import {
  Menu,
  Box,
  Typography,
  Divider,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Button,
} from "@mui/material";
import { ViewColumn as ViewColumnIcon } from "@mui/icons-material";
import {
  COLUMN_LABELS,
  type ColumnVisibility,
} from "../../constants/suggestionsColumns";

type ColumnVisibilityMenuProps = {
  columnVisibility: ColumnVisibility;
  onToggleColumn: (field: keyof ColumnVisibility) => void;
};

const ColumnVisibilityConfiguration = ({
  columnVisibility,
  onToggleColumn,
}: ColumnVisibilityMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<ViewColumnIcon />}
        onClick={handleOpen}
        size="medium"
        sx={{
          height: "fit-content",
          textTransform: "none",
          minWidth: "100px",
        }}
      >
        Columns
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: { minWidth: 220 },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Show Columns
          </Typography>
        </Box>
        <Divider />
        {(Object.keys(columnVisibility) as Array<keyof ColumnVisibility>).map(
          (field) => (
            <MenuItem key={field} onClick={() => onToggleColumn(field)} dense>
              <ListItemIcon>
                <Checkbox
                  checked={columnVisibility[field]}
                  size="small"
                  edge="start"
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText primary={COLUMN_LABELS[field]} />
            </MenuItem>
          )
        )}
      </Menu>
    </>
  );
};

export default ColumnVisibilityConfiguration;
