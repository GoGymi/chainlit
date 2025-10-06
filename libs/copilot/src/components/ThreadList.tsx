// import capitalize from 'lodash/capitalize';
import map from 'lodash/map';
import size from 'lodash/size';

import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { grey } from '@chainlit/app/src/theme';
import {
  ThreadHistory,
  useChatInteract,
  useChatSession
} from '@chainlit/react-client';

import { DeleteThreadButton } from './DeleteThreadButton';

interface ThreadListProps {
  threadHistory?: ThreadHistory;
  error?: string;
  refetch: () => void;
  isFetching: boolean;
  isLoadingMore: boolean;
}

export const ThreadList = ({
  threadHistory,
  error,
  refetch,
  isFetching,
  isLoadingMore
}: ThreadListProps) => {
  const { idToResume } = useChatSession();
  const { clear, setIdToResume } = useChatInteract();

  // Loading skeleton
  if (isFetching || (!threadHistory?.timeGroupedThreads && isLoadingMore)) {
    return (
      <Box>
        {[1, 2, 3].map((index) => (
          <Box key={`threads-skeleton-${index}`} sx={{ mt: 2 }}>
            <Skeleton width={80} height={12} sx={{ mb: 1 }} />
            {[1, 2].map((childIndex) => (
              <Stack
                key={`threads-skeleton-${index}-${childIndex}`}
                sx={{
                  py: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Skeleton width={12} height={12} />
                <Skeleton width={'100%'} height={12} />
              </Stack>
            ))}
          </Box>
        ))}
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ fontSize: '11px' }}>
        {error}
      </Alert>
    );
  }

  // No threads
  if (!threadHistory || size(threadHistory?.timeGroupedThreads) === 0) {
    return (
      <Alert severity="info" sx={{ fontSize: '11px' }}>
        No conversations yet
      </Alert>
    );
  }

  const handleThreadClick = (threadId: string) => {
    clear(); // Clear current messages
    setIdToResume(threadId); // Resume selected thread
  };

  const handleDeleteThread = (threadId: string) => {
    if (threadId === idToResume) {
      clear();
      setIdToResume(undefined);
    }
    refetch(); // Refresh list
  };

  return (
    <List
      sx={{
        bgcolor: 'background.paper',
        '& ul': { padding: 0 }
      }}
      subheader={<li />}
    >
      {map(threadHistory.timeGroupedThreads, (items, index) => {
        return (
          <li key={`section-${index}`}>
            <ul>
              <ListSubheader sx={{ px: 0, bgcolor: 'transparent' }}>
                <Typography
                  sx={{
                    py: 0.5,
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {index === 'Today'
                    ? 'Today'
                    : index === 'Yesterday'
                    ? 'Yesterday'
                    : index === 'Previous 7 days'
                    ? 'Last 7 days'
                    : index === 'Previous 30 days'
                    ? 'Last 30 days'
                    : index}
                </Typography>
              </ListSubheader>
              {map(items, (thread) => {
                const isSelected = idToResume === thread.id;

                return (
                  <Stack
                    key={`thread-${thread.id}`}
                    onClick={() => handleThreadClick(thread.id)}
                    sx={(theme) => ({
                      cursor: 'pointer',
                      p: 1,
                      mb: 0.5,
                      gap: 0.5,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderRadius: 1,
                      backgroundColor: isSelected
                        ? theme.palette.mode === 'dark'
                          ? grey[800]
                          : 'grey.200'
                        : 'transparent',
                      '&:hover': {
                        backgroundColor:
                          theme.palette.mode === 'dark' ? grey[800] : 'grey.200'
                      }
                    })}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={1}
                      sx={{
                        overflow: 'hidden',
                        flexGrow: 1,
                        minWidth: 0 // Allow text truncation
                      }}
                    >
                      <ChatBubbleOutline
                        sx={{
                          width: '12px',
                          height: '12px',
                          flexShrink: 0,
                          color: 'text.secondary'
                        }}
                      />
                      <Typography
                        sx={{
                          fontWeight: isSelected ? 600 : 400,
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: 'text.primary'
                        }}
                      >
                        {/* {capitalize(thread.name || 'Untitled')} */}
                        {thread.content[0].text || 'Untitled'}
                      </Typography>
                    </Stack>
                    {isSelected ? (
                      <DeleteThreadButton
                        threadId={thread.id}
                        onDelete={() => handleDeleteThread(thread.id)}
                      />
                    ) : null}
                  </Stack>
                );
              })}
            </ul>
          </li>
        );
      })}
      <Stack alignItems="center">
        <CircularProgress
          size={20}
          sx={{ my: 1, opacity: isLoadingMore ? 1 : 0 }}
        />
      </Stack>
    </List>
  );
};
