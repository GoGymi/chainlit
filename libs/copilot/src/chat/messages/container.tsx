import { Box } from '@mui/material';

import { useChatMessages } from '@chainlit/react-client';

interface Props {
  children: React.ReactNode;
}

export default function Container({ children }: Props) {
  const { messages } = useChatMessages();
  const hasMessages = messages?.length > 0;

  console.log('[Copilot MessageContainer] Render:', {
    messagesCount: messages?.length || 0,
    hasMessages
  });

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      flexGrow={1}
      position="relative"
      sx={{
        overflowY: hasMessages ? 'auto' : 'hidden',
        paddingBottom: hasMessages ? 2 : 0
      }}
    >
      {children}
    </Box>
  );
}
