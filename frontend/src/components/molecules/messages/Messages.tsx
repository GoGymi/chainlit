import { MessageContext } from 'contexts/MessageContext';
import { memo, useContext } from 'react';

import { useConfig } from '@chainlit/react-client';

import {
  type IAction,
  type IFeedback,
  type IMessageElement,
  type IStep
} from 'client-types/';

import MessageLoader from './Loader';
import { Message } from './Message';

interface Props {
  messages: IStep[];
  elements: IMessageElement[];
  actions: IAction[];
  indent: number;
  isRunning?: boolean;
  scorableRun?: IStep;
  onFeedbackUpdated?: (
    message: IStep,
    onSuccess: () => void,
    feedback: IFeedback
  ) => void;
  onFeedbackDeleted?: (
    message: IStep,
    onSuccess: () => void,
    feedbackId: string
  ) => void;
  callAction?: (action: IAction) => void;
}

const CL_RUN_NAMES = ['on_chat_start', 'on_message', 'on_audio_end'];

const hasToolStep = (step: IStep): boolean => {
  return (
    step.steps?.some(
      (s) => s.type === 'tool' || s.type.includes('message') || hasToolStep(s)
    ) || false
  );
};

const hasAssistantMessage = (step: IStep): boolean => {
  return (
    step.steps?.some(
      (s) => s.type === 'assistant_message' || hasAssistantMessage(s)
    ) || false
  );
};

const Messages = memo(
  ({
    messages,
    elements,
    actions,
    indent,
    isRunning,
    scorableRun,
    onFeedbackUpdated,
    onFeedbackDeleted,
    callAction: _callAction
  }: Props) => {
    const messageContext = useContext(MessageContext);
    const { config } = useConfig();

    // Create a merged context that includes the passed feedback callbacks
    const contextWithFeedback = {
      ...messageContext,
      onFeedbackUpdated: onFeedbackUpdated || messageContext.onFeedbackUpdated,
      onFeedbackDeleted: onFeedbackDeleted || messageContext.onFeedbackDeleted
    };

    return (
      <MessageContext.Provider value={contextWithFeedback}>
        <>
          {messages.map((m) => {
            // Handle chainlit runs
            if (CL_RUN_NAMES.includes(m.name)) {
              const isRunning = !m.end && !m.isError && messageContext.loading;
              const isToolCallCoT = config?.ui.cot === 'tool_call';
              const isHiddenCoT = config?.ui.cot === 'hidden';

              const showToolCoTLoader = isToolCallCoT
                ? isRunning && !hasToolStep(m)
                : false;

              const showHiddenCoTLoader = isHiddenCoT
                ? isRunning && !hasAssistantMessage(m)
                : false;
              // Ignore on_chat_start for scorable run
              const scorableRun =
                !isRunning && m.name !== 'on_chat_start' ? m : undefined;
              return (
                <>
                  {m.steps?.length ? (
                    <Messages
                      key={m.id}
                      messages={m.steps}
                      elements={elements}
                      actions={actions}
                      indent={indent}
                      isRunning={isRunning}
                      scorableRun={scorableRun}
                    />
                  ) : null}
                  <MessageLoader
                    key={m.id + 'loader'}
                    show={showToolCoTLoader || showHiddenCoTLoader}
                  />
                </>
              );
            } else {
              // Score the current run
              const _scorableRun = m.type === 'run' ? m : scorableRun;
              // The message is scorable if it is the last assistant message of the run

              const isRunLastAssistantMessage =
                m ===
                _scorableRun?.steps?.findLast(
                  (_m) => _m.type === 'assistant_message'
                );

              const isLastAssistantMessage =
                messages.findLast((_m) => _m.type === 'assistant_message') ===
                m;

              const isScorable =
                isRunLastAssistantMessage || isLastAssistantMessage;

              return (
                <Message
                  message={m}
                  elements={elements}
                  actions={actions}
                  key={m.id}
                  indent={indent}
                  isRunning={isRunning}
                  scorableRun={_scorableRun}
                  isScorable={isScorable}
                />
              );
            }
          })}
        </>
      </MessageContext.Provider>
    );
  }
);

export { Messages };
