import { WidgetContext } from 'context';
import { useCallback, useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { toast } from 'sonner';

import { Messages as MessagesComponent } from '@chainlit/app/src/components/molecules/messages/Messages';
import {
  ChainlitContext,
  IFeedback,
  IStep,
  messagesState,
  updateMessageById,
  useChatData,
  useChatInteract,
  useChatMessages
} from '@chainlit/react-client';

const Messages = (): JSX.Element => {
  const apiClient = useContext(ChainlitContext);
  const { accessToken } = useContext(WidgetContext);
  const { elements, loading, actions } = useChatData();
  const { messages } = useChatMessages();
  const { callAction } = useChatInteract();
  const setMessages = useSetRecoilState(messagesState);

  const onFeedbackUpdated = useCallback(
    async (message: IStep, onSuccess: () => void, feedback: IFeedback) => {
      try {
        toast.promise(apiClient.setFeedback(feedback, accessToken), {
          loading: 'Updating...',
          success: (res) => {
            setMessages((prev) =>
              updateMessageById(prev, message.id, {
                ...message,
                feedback: {
                  ...feedback,
                  id: res.feedbackId
                }
              })
            );
            onSuccess();
            return 'Feedback updated!';
          },
          error: (err) => {
            return <span>{err.message}</span>;
          }
        });
      } catch (err) {
        console.log(err);
      }
    },
    [apiClient, accessToken, setMessages]
  );

  const onFeedbackDeleted = useCallback(
    async (message: IStep, onSuccess: () => void, feedbackId: string) => {
      try {
        toast.promise(apiClient.deleteFeedback(feedbackId, accessToken), {
          loading: 'Updating...',
          success: () => {
            setMessages((prev) =>
              updateMessageById(prev, message.id, {
                ...message,
                feedback: undefined
              })
            );
            onSuccess();
            return 'Feedback updated!';
          },
          error: (err) => {
            return <span>{err.message}</span>;
          }
        });
      } catch (err) {
        console.log(err);
      }
    },
    [apiClient, accessToken, setMessages]
  );

  return (
    <MessagesComponent
      messages={messages}
      elements={elements}
      actions={actions}
      onFeedbackUpdated={onFeedbackUpdated}
      onFeedbackDeleted={onFeedbackDeleted}
      callAction={callAction}
      indent={0}
      isRunning={loading}
    />
  );
};

export default Messages;
