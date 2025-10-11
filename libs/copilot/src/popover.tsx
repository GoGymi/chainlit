import Chat from 'chat';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Box, Stack } from '@mui/material';
import Fade from '@mui/material/Fade';

import { useAuth, useConfig } from '@chainlit/react-client';

import Header from 'components/Header';
import { HistoryPanel } from 'components/HistoryPanel';

import { copilotSettingsState } from './state/settings';

interface Props {
  anchorEl?: HTMLElement | null;
  buttonHeight: string;
}

export default function PopOver({ anchorEl, buttonHeight }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { accessToken } = useAuth();
  const { config } = useConfig();
  const settings = useRecoilValue(copilotSettingsState);
  const setSettings = useSetRecoilState(copilotSettingsState);

  // Calculate popover width based on history panel state
  const enableHistory = !!accessToken && !!config?.dataPersistence;
  const showHistoryPanel = enableHistory && settings.isSidebarOpen;

  const baseWidth = 400;
  const historyPanelWidth = 200;
  const popoverWidth = expanded
    ? '80vw'
    : showHistoryPanel
    ? `min(${baseWidth + historyPanelWidth}px, 90vw)` // 600px total
    : `min(${baseWidth}px, 90vw)`; // 400px total

  const handlePanelClose = () => {
    setSettings((prev) => ({ ...prev, isSidebarOpen: false }));
  };

  return (
    <Box
      id="chainlit-copilot-popover"
      sx={{
        display: anchorEl ? 'flex' : 'none',
        flexDirection: 'column',
        // inset: 'auto auto 14px -24px !important',
        height: `min(730px, calc(100vh - ${buttonHeight} - 48px - 76px))`,
        width: popoverWidth,
        overflow: 'hidden',
        bottom: '108px',
        right: '24px',
        position: 'absolute',
        borderRadius: '12px',
        background: (theme) => theme.palette.background.default,
        boxShadow:
          '0 6px 6px 0 rgba(0,0,0,.02),0 8px 24px 0 rgba(0,0,0,.12)!important',
        zIndex: 1000,
        transition: 'width 0.3s ease'
      }}
    >
      <Fade in={!!anchorEl}>
        <Stack
          direction="row"
          sx={{
            height: '100%',
            width: '100%'
          }}
        >
          {enableHistory ? (
            <HistoryPanel
              isOpen={settings.isSidebarOpen}
              onClose={handlePanelClose}
            />
          ) : null}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              flexGrow: 1,
              minWidth: 0
            }}
          >
            <Header expanded={expanded} setExpanded={setExpanded} />
            <Chat />
          </Box>
        </Stack>
      </Fade>
    </Box>
  );
}
