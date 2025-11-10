import { useMediaQuery, useTheme } from '@mui/material';

export const useViewSize = () => {
  const theme = useTheme();

  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  return {
    isSmall,
  };
};
