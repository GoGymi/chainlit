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

interface ThreadListProps {
  threadHistory?: ThreadHistory;
  error?: string;
  isFetching: boolean;
  isLoadingMore: boolean;
  filter?: string;
}

export const ThreadList = ({
  threadHistory,
  error,
  isFetching,
  isLoadingMore,
  filter
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

  // Delete thread functionality removed

  // Client-side filter of grouped threads
  const filteredGroups = map(
    threadHistory.timeGroupedThreads,
    (items, index) => {
      if (!filter) return { index, items };
      const q = filter.toLowerCase();
      const itemsFiltered = items.filter((t: any) => {
        const name = (t.name || t.content?.[0]?.text || '').toLowerCase();
        return name.includes(q);
      });
      return { index, items: itemsFiltered };
    }
  ).filter((g: any) => g.items.length > 0);

  return (
    <List
      sx={{
        bgcolor: 'background.paper',
        '& ul': { padding: 0 }
      }}
      subheader={<li />}
    >
      {filteredGroups.map(({ items, index }: any) => {
        return (
          <li key={`section-${index}`}>
            <ul>
              <ListSubheader sx={{ px: 0, bgcolor: 'background.paper' }}>
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
                    ? 'Heute'
                    : index === 'Yesterday'
                    ? 'Gestern'
                    : index === 'Previous 7 days'
                    ? 'Letzte 7 Tage'
                    : index === 'Previous 30 days'
                    ? 'Letzte 30 Tage'
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
                    {/* Delete thread button removed */}
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
