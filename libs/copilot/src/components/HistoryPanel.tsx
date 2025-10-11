import { useEffect, useRef, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { Box, Drawer, IconButton, Stack, useMediaQuery } from '@mui/material';

import { useAuth, useConfig } from '@chainlit/react-client';

import { useThreads } from '../hooks/useThreads';

import { SearchBar } from './SearchBar';
import { ThreadList } from './ThreadList';

const PANEL_WIDTH = 200;

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryPanel = ({ isOpen, onClose }: HistoryPanelProps) => {
  const isMobile = useMediaQuery('(max-width: 600px)');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { accessToken } = useAuth();
  const { config } = useConfig();

  const {
    threadHistory,
    isLoading,
    isFetchingNextPage,
    error,
    fetchNextPage,
    hasNextPage
  } = useThreads();

  // Only show if authenticated and data persistence enabled
  const enableHistory = !!accessToken && !!config?.dataPersistence;

  // Infinite scroll handler
  const handleScroll = () => {
    if (!scrollRef.current || !hasNextPage || isFetchingNextPage) return;

    const { scrollHeight, clientHeight, scrollTop } = scrollRef.current;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (atBottom) {
      fetchNextPage();
    }
  };

  // Close panel on mobile when thread is selected
  useEffect(() => {
    if (isMobile && threadHistory?.currentThreadId) {
      onClose();
    }
  }, [threadHistory?.currentThreadId, isMobile]);

  if (!enableHistory) return null;

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={isOpen}
      onClose={onClose}
      anchor="left"
      container={window.cl_shadowRootElement}
      hideBackdrop={!isMobile}
      sx={{
        width: isOpen ? PANEL_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: PANEL_WIDTH,
          position: 'relative',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxSizing: 'border-box',
          overflow: 'hidden',
          overscrollBehavior: 'contain'
        }
      }}
    >
      <Stack
        sx={{
          height: '100%',
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          pt: isMobile ? '112px' : 1.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchBar onSearch={setSearchQuery} />
          {isMobile && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Box
          ref={scrollRef}
          onScroll={handleScroll}
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,.2)',
              borderRadius: '3px'
            }
          }}
        >
          <ThreadList
            threadHistory={threadHistory}
            error={error}
            isFetching={isLoading}
            isLoadingMore={isFetchingNextPage}
            filter={searchQuery}
          />
        </Box>
      </Stack>
    </Drawer>
  );
};
