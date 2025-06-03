import { useCallback, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Box, Button, Fade, Grid, Stack, Typography } from '@mui/material';

import {
  ChainlitContext,
  IStarter,
  IStep,
  useAuth,
  useChatData,
  useChatInteract,
  useConfig
} from '@chainlit/react-client';

interface Props {
  show: boolean;
}

interface StarterProps {
  starter: IStarter;
}

function Starter({ starter }: StarterProps) {
  const apiClient = useContext(ChainlitContext);
  const { sendMessage } = useChatInteract();
  const { loading } = useChatData();
  const { user } = useAuth();

  const onSubmit = useCallback(async () => {
    console.log('[Copilot Starter] Starter clicked:', {
      label: starter.label,
      message: starter.message,
      icon: starter.icon,
      user: user?.identifier
    });

    const message: IStep = {
      threadId: '',
      id: uuidv4(),
      name: user?.identifier || 'User',
      type: 'user_message',
      output: starter.message,
      createdAt: new Date().toISOString()
    };

    console.log('[Copilot Starter] Sending starter message:', message);
    sendMessage(message, []);
  }, [user, sendMessage, starter]);

  return (
    <Button
      id={`copilot-starter-${starter.label
        .trim()
        .toLowerCase()
        .replaceAll(' ', '-')}`}
      fullWidth
      disabled={loading}
      color="inherit"
      sx={{
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: '1rem',
        height: 80,
        p: 1.5,
        textTransform: 'none',
        justifyContent: 'flex-start'
      }}
      onClick={onSubmit}
    >
      <Stack gap={0.5} flexGrow={1} height="100%">
        {starter.icon ? (
          <img
            style={{ borderRadius: '50%' }}
            src={
              starter.icon?.startsWith('/public')
                ? apiClient.buildEndpoint(starter.icon)
                : starter.icon
            }
            alt={starter.label}
            height={16}
            width={16}
          />
        ) : (
          <Box sx={{ height: 16, width: 16 }} />
        )}
        <Typography
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            fontSize: '12px'
          }}
          color="text.secondary"
          align="left"
        >
          {starter.label}
        </Typography>
      </Stack>
    </Button>
  );
}

export default function WelcomeScreen({ show }: Props) {
  const { config } = useConfig();

  console.log('[Copilot WelcomeScreen] Render:', {
    hasConfig: !!config,
    hasStarters: !!config?.starters,
    startersCount: config?.starters?.length || 0,
    starters: config?.starters
  });

  if (!config?.starters?.length) {
    console.log('[Copilot WelcomeScreen] No starters available, not rendering');
    return null;
  }

  return (
    <Fade in={show}>
      <Stack
        position="absolute"
        zIndex={show ? 1 : -1}
        width="100%"
        height="100%"
        mx="auto"
        left={0}
        right={0}
        sx={{ overflowY: 'auto' }}
        maxWidth="min(24rem, 90vw)"
        justifyContent="center"
        alignItems="center"
        gap={3}
        px={2}
        boxSizing={'border-box'}
      >
        <Typography variant="h6" color="text.secondary" align="center">
          Get started with one of these prompts:
        </Typography>
        <Grid container spacing={1.5} minHeight={80} justifyContent="center">
          {config?.starters.map((starter, i) => (
            <Fade in={show} timeout={i * 200} key={i}>
              <Grid item xs={6}>
                <Starter starter={starter} />
              </Grid>
            </Fade>
          ))}
        </Grid>
      </Stack>
    </Fade>
  );
}
