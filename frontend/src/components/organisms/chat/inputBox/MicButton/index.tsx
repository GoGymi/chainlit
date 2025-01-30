import {
  CircularProgress,
  IconButton,
  Theme,
  Tooltip,
  useMediaQuery
} from '@mui/material';

import { useAudio } from '@chainlit/react-client';

// Import useChatSession
import { Translator } from 'components/i18n';

import MicrophoneIcon from 'assets/microphone';
import MicrophoneOffIcon from 'assets/microphoneOff';

interface Props {
  disabled?: boolean;
}

const MicButton = ({ disabled }: Props) => {
  const { startConversation, endConversation, audioConnection } = useAudio();

  const size = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'))
    ? 'small'
    : 'medium';

  return (
    <>
      <Tooltip
        title={
          <Translator
            path={
              audioConnection === 'on'
                ? 'components.organisms.chat.inputBox.speechButton.stop'
                : audioConnection === 'off'
                ? 'components.organisms.chat.inputBox.speechButton.start'
                : 'components.organisms.chat.inputBox.speechButton.loading'
            }
          />
        }
      >
        <span>
          <IconButton
            disabled={disabled}
            color="inherit"
            size={size}
            onClick={
              audioConnection === 'on'
                ? endConversation
                : audioConnection === 'off'
                ? startConversation
                : undefined
            }
          >
            {audioConnection === 'on' ? (
              <MicrophoneOffIcon fontSize={size} />
            ) : null}
            {audioConnection === 'off' ? (
              <MicrophoneIcon fontSize={size} />
            ) : null}
            {audioConnection === 'connecting' ? (
              <CircularProgress
                color="inherit"
                variant="indeterminate"
                size={18}
              />
            ) : null}
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
};

export default MicButton;
