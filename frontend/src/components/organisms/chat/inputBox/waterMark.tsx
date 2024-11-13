import { Typography } from '@mui/material';

import { Translator } from 'components/i18n';

export default function WaterMark() {
  return (
    <p
      style={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none'
      }}
    >
      <Typography fontSize="12px" color="text.secondary">
        <Translator path="components.organisms.chat.inputBox.waterMark.text" />
      </Typography>
    </p>
  );
}
