import '@mui/material/Button';
import '@mui/material/styles';
import '@mui/material/Typography';
import { PaletteColor, PaletteColorOptions } from '@mui/material';

declare module '@mui/material/styles' {
  interface Palette {
    chrome: PaletteColor;
  }

  interface PaletteOptions {
    chrome?: PaletteColorOptions;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    chrome: true;
  }
}
