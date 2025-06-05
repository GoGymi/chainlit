import { useCallback, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Button, Fade, Grid, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

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

const StyledStarterButton = styled(Button, {
  name: 'StarterComponent',
  slot: 'StarterButton'
})((_) => ({
  '&': {
    display: 'none'
  }
}));

function Starter({ starter }: StarterProps) {
  const apiClient = useContext(ChainlitContext);
  const { sendMessage } = useChatInteract();
  const { loading } = useChatData();
  const { user } = useAuth();

  const onSubmit = useCallback(async () => {
    const message: IStep = {
      threadId: '',
      id: uuidv4(),
      name: user?.identifier || 'User',
      type: 'user_message',
      output: starter.label,
      createdAt: new Date().toISOString()
    };

    sendMessage(message, []);
  }, [user, sendMessage, starter]);

  return (
    <StyledStarterButton
      id={`copilot-starter-${starter.label
        .trim()
        .toLowerCase()
        .replaceAll(' ', '-')}`}
      fullWidth
      disabled={loading}
      color="inherit"
      className="starter-button"
      sx={{
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: '1rem',
        p: 1.5,
        textTransform: 'none',
        justifyContent: 'flex-start',
        overflow: 'auto'
      }}
      onClick={onSubmit}
    >
      <Stack
        gap={0.5}
        flexGrow={1}
        height="100%"
        justifyContent="center"
        alignItems="center"
      >
        {starter.icon && (
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
        )}
        <Typography
          sx={{
            overflow: 'auto',
            fontSize: '12px',
            flexGrow: 1
          }}
          color="text.secondary"
          align="left"
        >
          {starter.label}
        </Typography>
      </Stack>
    </StyledStarterButton>
  );
}

export default function WelcomeScreen({ show }: Props) {
  const { config } = useConfig();

  if (!config?.starters?.length) {
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
