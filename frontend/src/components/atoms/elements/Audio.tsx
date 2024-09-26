import { useEffect, useState } from 'react';
import { grey } from 'theme/palette';

import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';

import { type IAudioElement } from 'client-types/';

const AudioElement = ({ element }: { element: IAudioElement }) => {
  const theme = useTheme();

  // Ensures the element only autplays once
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  useEffect(() => {
    // Unique key for each audio based on its URL
    const autoplayedKey = `audio-autoplayed-${element.url}`;

    // localStorage persists across component unmounts and remounts (like when the widget is closed and opened)
    const hasAutoplayed = localStorage.getItem(autoplayedKey);

    if (!hasAutoplayed && element.autoPlay) {
      // Autoplay the audio and mark it as played
      setShouldAutoPlay(true);
      localStorage.setItem(autoplayedKey, 'true');
    } else {
      setShouldAutoPlay(false);
    }
  }, [element.url, element.autoPlay]);

  if (!element.url) {
    return null;
  }

  return (
    <Box className={`${element.display}-audio`}>
      <Typography
        sx={{
          fontSize: '14px',
          lineHeight: 1.72,
          color: theme.palette.mode === 'dark' ? grey[300] : grey[700],
          marginBottom: theme.spacing(0.5)
        }}
      >
        {element.name}
      </Typography>
      <audio controls src={element.url} autoPlay={shouldAutoPlay}></audio>
    </Box>
  );
};

export { AudioElement };
