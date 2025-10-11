import { useTheme, useMediaQuery } from "@mui/material";

export const useResponsive = () => {
  const theme = useTheme();

  return {
    isSmallScreen: useMediaQuery(theme.breakpoints.down("sm")),
    isMediumScreen: useMediaQuery(theme.breakpoints.between("sm", "md")),
    isLargeScreen: useMediaQuery(theme.breakpoints.up("lg")),
  };
};
