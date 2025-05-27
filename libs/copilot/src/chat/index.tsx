import { WidgetContext } from 'context';
import { useContext, useEffect } from 'react';

import {
  useChatInteract,
  useChatSession,
  useConfig
} from '@chainlit/react-client';

import ChatBody from './body';

export default function ChatWrapper() {
  const { accessToken } = useContext(WidgetContext);
  const { connect, session } = useChatSession();
  const { sendMessage } = useChatInteract();
  const { config } = useConfig();

  useEffect(() => {
    if (session?.socket?.connected) return;
    console.log(
      '[Copilot ChatWrapper] Connecting to session with access token'
    );
    connect({
      userEnv: {},
      accessToken: `Bearer ${accessToken}`
    });
  }, [connect, accessToken]);

  useEffect(() => {
    // @ts-expect-error is not a valid prop
    window.sendChainlitMessage = sendMessage;
  }, [sendMessage]);

  useEffect(() => {
    if (session?.socket?.connected && config) {
      console.log('[Copilot ChatWrapper] Session connected, config loaded:', {
        hasConfig: !!config,
        startersAvailable: !!config.starters,
        startersCount: config.starters?.length || 0
      });
    }
  }, [session?.socket?.connected, config]);

  return <ChatBody />;
}
