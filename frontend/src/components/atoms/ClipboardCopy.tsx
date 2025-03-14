import { useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import CopyIcon from 'assets/copy';

interface ClipboardCopyProps {
  value: string;
  theme?: 'dark' | 'light';
  edge?: IconButtonProps['edge'];
}

const ClipboardCopy = ({ value, edge }: ClipboardCopyProps): JSX.Element => {
  const [isCopied, setIsCopied] = useState(false);
  const [_, copy] = useCopyToClipboard();

  const handleCopy = () => {
    copy(value)
      .then(() => {
        setIsCopied(true);
      })
      .catch((err) => console.log('An error occurred while copying: ', err));
  };

  const handleTooltipClose = () => {
    setIsCopied(false);
  };

  return (
    <Tooltip
      title={isCopied ? 'In die Zwischenablage kopiert!' : 'Kopieren'}
      onClose={handleTooltipClose}
      sx={{ zIndex: 2 }}
    >
      <IconButton color="inherit" edge={edge} onClick={handleCopy}>
        <CopyIcon sx={{ height: 16, width: 16 }} />
      </IconButton>
    </Tooltip>
  );
};

export { ClipboardCopy };
