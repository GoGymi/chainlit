import { useRecoilState } from 'recoil';

import HistoryIcon from '@mui/icons-material/History';
import { IconButton, Stack, Tooltip } from '@mui/material';

import ExpandIcon from '@chainlit/app/src/assets/expand';
import MinimizeIcon from '@chainlit/app/src/assets/minimize';
import { Logo } from '@chainlit/app/src/components/atoms/logo';
import AudioPresence from '@chainlit/app/src/components/organisms/chat/inputBox/AudioPresence';
import { useAudio, useAuth, useConfig } from '@chainlit/react-client';

import { copilotSettingsState } from '../state/settings';

import ChatProfiles from './ChatProfiles';
import NewChatButton from './NewChatButton';

interface Props {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

const Header = ({ expanded, setExpanded }: Props): JSX.Element => {
  const { audioConnection } = useAudio();
  const { accessToken } = useAuth();
  const { config } = useConfig();
  const [settings, setSettings] = useRecoilState(copilotSettingsState);

  // Show history button only if data persistence is enabled AND user is authenticated
  const enableHistory = !!accessToken && !!config?.dataPersistence;

  const toggleSidebar = () => {
    setSettings((prev) => ({
      ...prev,
      isSidebarOpen: !prev.isSidebarOpen
    }));
  };

  return (
    <Stack
      px={2}
      py={1.5}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      bgcolor="background.paper"
    >
      <Stack direction="row" alignItems="center" spacing={0.5}>
        {enableHistory ? (
          <Tooltip
            title={
              settings.isSidebarOpen ? 'Verlauf ausblenden' : 'Verlauf anzeigen'
            }
            arrow
          >
            <IconButton onClick={toggleSidebar} size="small" sx={{ mr: 0.5 }}>
              <HistoryIcon sx={{ width: 16, height: 16 }} />
            </IconButton>
          </Tooltip>
        ) : null}
        <Logo style={{ maxHeight: '25px' }} />
        <IconButton onClick={() => setExpanded(!expanded)}>
          {expanded ? (
            <MinimizeIcon sx={{ width: 16, height: 16 }} />
          ) : (
            <ExpandIcon sx={{ width: 16, height: 16 }} />
          )}
        </IconButton>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        {audioConnection === 'on' ? (
          <AudioPresence
            type="server"
            height={20}
            width={40}
            barCount={4}
            barSpacing={2}
          />
        ) : null}
        <ChatProfiles />
        <NewChatButton />
      </Stack>
    </Stack>
  );
};

export default Header;
