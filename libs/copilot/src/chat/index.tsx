import { WidgetContext } from 'context';
import { useContext, useEffect } from 'react';

import { useChatInteract, useChatSession } from '@chainlit/react-client';

import ChatBody from './body';

export default function ChatWrapper() {
  const { accessToken } = useContext(WidgetContext);
  const { connect, session, idToResume } = useChatSession();
  const { sendMessage } = useChatInteract();

  useEffect(() => {
    if (session?.socket?.connected) return;
    connect({
      userEnv: {},
      accessToken: `Bearer ${accessToken}`
    });
  }, [connect, accessToken]);

  useEffect(() => {
    if (idToResume && session?.socket?.connected) {
      // Thread resumption is handled automatically by useChatSession
      // Just ensure the connection is ready
      console.debug('Resuming thread:', idToResume);
    }
  }, [idToResume, session?.socket?.connected]);

  useEffect(() => {
    // @ts-expect-error is not a valid prop
    window.sendChainlitMessage = sendMessage;
  }, [sendMessage]);

  return <ChatBody />;
}
