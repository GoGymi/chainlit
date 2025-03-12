import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import 'regenerator-runtime';

import TuneIcon from '@mui/icons-material/Tune';
import { Box, IconButton, Stack, TextField } from '@mui/material';

import { useTranslation } from '@chainlit/app/src/components/i18n/Translator';
import { Attachments } from '@chainlit/app/src/components/molecules/attachments';
import MicButton from '@chainlit/app/src/components/organisms/chat/inputBox/MicButton';
import { SubmitButton } from '@chainlit/app/src/components/organisms/chat/inputBox/SubmitButton';
import UploadButton from '@chainlit/app/src/components/organisms/chat/inputBox/UploadButton';
import InputBoxFooter from '@chainlit/app/src/components/organisms/chat/inputBox/footer';
import { IAttachment, attachmentsState } from '@chainlit/app/src/state/chat';
import { chatSettingsOpenState } from '@chainlit/app/src/state/project';
import { inputHistoryState } from '@chainlit/app/src/state/userInputHistory';
import { FileSpec, useChatData, useChatSession } from '@chainlit/react-client';

interface Props {
  fileSpec: FileSpec;
  onFileUpload: (payload: File[]) => void;
  onFileUploadError: (error: string) => void;
  onSubmit: (message: string, attachments?: IAttachment[]) => void;
  onReply: (message: string) => void;
}

function getLineCount(el: HTMLDivElement) {
  console.log('getLineCount called for element:', el);
  const textarea = el.querySelector('textarea');
  if (!textarea) {
    console.log('No textarea found in element');
    return 0;
  }
  const lines = textarea.value.split('\n');
  console.log(`Found ${lines.length} lines in textarea`);
  return lines.length;
}

const Input = memo(
  ({ fileSpec, onFileUpload, onFileUploadError, onSubmit, onReply }: Props) => {
    console.log('Input component rendering with fileSpec:', fileSpec);

    const [attachments, setAttachments] = useRecoilState(attachmentsState);
    const setInputHistory = useSetRecoilState(inputHistoryState);
    const setChatSettingsOpen = useSetRecoilState(chatSettingsOpenState);
    const [currentMode, setCurrentMode] = useState<string | null>(() => {
      console.log('Initializing currentMode from sessionStorage');
      // Initialize from sessionStorage if available
      const mode = sessionStorage.getItem('copilot_mode');
      const timestamp = sessionStorage.getItem('copilot_mode_timestamp');

      console.log(
        'Retrieved from sessionStorage - mode:',
        mode,
        'timestamp:',
        timestamp
      );

      // Only use the stored mode if it has a valid timestamp and is less than 5 minutes old
      // This handles cases where unload events didn't fire properly
      if (mode && timestamp && Date.now() - Number(timestamp) < 300000) {
        console.log('Using stored mode:', mode);
        return mode;
      }

      // Otherwise clear stale data
      console.log('Clearing stale mode data from sessionStorage');
      sessionStorage.removeItem('copilot_mode');
      sessionStorage.removeItem('copilot_mode_timestamp');
      return null;
    });
    const { session } = useChatSession();
    const socket = session?.socket;
    console.log('Chat session initialized - socket available:', !!socket);

    const ref = useRef<HTMLDivElement>(null);
    const {
      loading,
      askUser,
      chatSettingsInputs,
      disabled: _disabled
    } = useChatData();
    console.log('Chat data loaded:', {
      loading,
      askUser,
      chatSettingsInputsCount: chatSettingsInputs.length,
      _disabled
    });

    const [value, setValue] = useState('');
    const [isComposing, setIsComposing] = useState(false);

    const disabled = _disabled || !!attachments.find((a) => !a.uploaded);
    console.log(
      'Input disabled state:',
      disabled,
      'Reason:',
      _disabled
        ? 'disabled from useChatData'
        : attachments.find((a) => !a.uploaded)
        ? 'pending attachment upload'
        : 'not disabled'
    );

    const { t } = useTranslation();

    // Listen for mode changes from the backend
    useEffect(() => {
      console.log('Setting up socket listeners for mode changes');

      if (socket) {
        const handleModeChange = (data: { mode: string }) => {
          console.log('Received mode change event:', data);
          setCurrentMode(data.mode);
          // Store the mode in sessionStorage with a timestamp
          sessionStorage.setItem('copilot_mode', data.mode);
          // Add a timestamp to verify freshness on page reload
          sessionStorage.setItem(
            'copilot_mode_timestamp',
            Date.now().toString()
          );
          console.log('Updated sessionStorage with new mode and timestamp');
        };

        const handlePageUnload = () => {
          console.log('Page unload detected, clearing mode data');
          // Clear mode when page unloads
          sessionStorage.removeItem('copilot_mode');
          sessionStorage.removeItem('copilot_mode_timestamp');
        };

        socket.on('copilot_mode', handleModeChange);
        console.log('Emitting get_copilot_mode request');
        socket.emit('get_copilot_mode');

        // Use multiple events to catch all navigation/unload scenarios
        window.addEventListener('beforeunload', handlePageUnload, {
          capture: true
        });
        window.addEventListener('pagehide', handlePageUnload, {
          capture: true
        });
        window.addEventListener('unload', handlePageUnload, { capture: true });
        window.addEventListener('hashchange', handlePageUnload);
        window.addEventListener('popstate', handlePageUnload);
        console.log('Attached page unload event listeners');

        return () => {
          console.log('Cleaning up socket listeners and event handlers');
          socket.off('copilot_mode', handleModeChange);
          window.removeEventListener('beforeunload', handlePageUnload, {
            capture: true
          });
          window.removeEventListener('pagehide', handlePageUnload, {
            capture: true
          });
          window.removeEventListener('unload', handlePageUnload, {
            capture: true
          });
          window.removeEventListener('hashchange', handlePageUnload);
          window.removeEventListener('popstate', handlePageUnload);

          // Explicitly clear mode when component unmounts
          handlePageUnload();
        };
      } else {
        console.log('No socket available, skipping mode change listeners');
      }
    }, [socket]);

    // Helper function to check if features should be hidden based on mode
    const shouldHideFeature = useCallback(() => {
      const shouldHide = currentMode === 'mathpractice';
      console.log(
        'Checking if features should be hidden:',
        shouldHide,
        'Current mode:',
        currentMode
      );
      return shouldHide;
    }, [currentMode]);

    useEffect(() => {
      console.log('Setting up paste event listener');

      const pasteEvent = (event: ClipboardEvent) => {
        console.log('Paste event detected');
        if (event.clipboardData && event.clipboardData.items) {
          const items = Array.from(event.clipboardData.items);
          console.log('Clipboard items:', items.length);
          items.forEach((item, index) => {
            console.log(
              `Processing clipboard item ${index}:`,
              item.kind,
              item.type
            );
            if (item.kind === 'file') {
              const file = item.getAsFile();
              if (file) {
                console.log(
                  'File found in clipboard:',
                  file.name,
                  file.type,
                  file.size
                );
                onFileUpload([file]);
              }
            }
          });
        }
      };

      if (!ref.current) {
        console.log('No ref.current available, skipping paste event listener');
        return;
      }

      const input = ref.current;
      input.addEventListener('paste', pasteEvent);
      console.log('Paste event listener attached');

      return () => {
        console.log('Removing paste event listener');
        input.removeEventListener('paste', pasteEvent);
      };
    }, []);

    useEffect(() => {
      console.log(
        'Focus effect triggered - loading:',
        loading,
        'disabled:',
        disabled
      );
      if (ref.current && !loading && !disabled) {
        console.log('Setting focus to input');
        ref.current.focus();
      }
    }, [loading, disabled]);

    const submit = useCallback(() => {
      console.log(
        'Submit function called - value:',
        value,
        'disabled:',
        disabled
      );

      if (value === '' || disabled) {
        console.log('Submit canceled - empty value or disabled state');
        return;
      }

      if (askUser) {
        console.log('Replying to askUser prompt');
        onReply(value);
      } else {
        console.log(
          'Submitting new message with attachments:',
          attachments.length
        );
        onSubmit(value, attachments);
      }

      setAttachments([]);
      setValue('');
      console.log('Reset input state after submission');
    }, [
      value,
      disabled,
      setValue,
      askUser,
      attachments,
      setAttachments,
      onSubmit
    ]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        console.log(
          'Key down event:',
          e.key,
          'ShiftKey:',
          e.shiftKey,
          'isComposing:',
          isComposing
        );

        if (e.key === 'Enter' && !e.shiftKey) {
          if (!isComposing) {
            console.log(
              'Enter key detected without shift - preventing default and submitting'
            );
            e.preventDefault();
            submit();
          } else {
            console.log('Enter key ignored while composing');
          }
        } else if (e.key === 'ArrowUp') {
          console.log('ArrowUp key detected');
          const lineCount = getLineCount(e.currentTarget as HTMLDivElement);
          if (lineCount <= 1) {
            console.log('Opening input history');
            setInputHistory((old) => ({ ...old, open: true }));
          }
        }
      },
      [submit, setInputHistory, isComposing]
    );

    console.log('Rendering Input component with current state', {
      valueLength: value.length,
      attachmentsCount: attachments.length,
      currentMode,
      isComposing,
      disabled
    });

    return (
      <>
        <Stack
          sx={{
            backgroundColor: 'background.default',
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            margin: 1,
            paddingTop: 1,
            paddingX: 1,
            boxShadow: 'box-shadow: 0px 2px 4px 0px #0000000D',
            gap: 1,
            textarea: {
              height: '34px',
              maxHeight: '30vh',
              overflowY: 'auto !important',
              resize: 'none',
              color: 'text.primary',
              lineHeight: '24px'
            }
          }}
        >
          {attachments.length > 0 ? (
            <Box mt={2}>
              <Attachments />
            </Box>
          ) : null}
          <TextField
            inputRef={ref}
            id="copilot-chat-input"
            multiline
            variant="standard"
            autoComplete="false"
            placeholder={t(
              'components.organisms.chat.inputBox.input.placeholder'
            )}
            disabled={disabled}
            onChange={(e) => {
              console.log('Input value changed:', e.target.value.length);
              setValue(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => {
              console.log('Composition started');
              setIsComposing(true);
            }}
            onCompositionEnd={() => {
              console.log('Composition ended');
              setIsComposing(false);
            }}
            value={value}
            fullWidth
            InputProps={{
              disableUnderline: true,
              sx: {
                pl: 0,
                width: '100%'
              },
              endAdornment: (
                <Box sx={{ mr: -2 }}>
                  <SubmitButton
                    onSubmit={() => {
                      console.log('Submit button clicked');
                      submit();
                    }}
                    disabled={disabled || (!loading && !value)}
                  />
                </Box>
              )
            }}
          />
          <Stack
            direction="row"
            alignItems="center"
            color="text.secondary"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" marginLeft={-1}>
              {!shouldHideFeature() && (
                <UploadButton
                  disabled={disabled}
                  fileSpec={fileSpec}
                  onFileUploadError={(error) => {
                    console.log('File upload error:', error);
                    onFileUploadError(error);
                  }}
                  onFileUpload={(files) => {
                    console.log('Files selected for upload:', files.length);
                    onFileUpload(files);
                  }}
                />
              )}

              {chatSettingsInputs.length > 0 && (
                <IconButton
                  id="chat-settings-open-modal"
                  disabled={disabled}
                  color="inherit"
                  onClick={() => {
                    console.log('Opening chat settings modal');
                    setChatSettingsOpen(true);
                  }}
                  size="small"
                >
                  <TuneIcon fontSize="small" />
                </IconButton>
              )}
              {!shouldHideFeature() && <MicButton disabled={disabled} />}
            </Stack>
            <Box>
              <InputBoxFooter />
            </Box>
          </Stack>
        </Stack>
      </>
    );
  }
);

export default Input;
