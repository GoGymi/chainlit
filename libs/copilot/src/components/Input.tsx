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
  const textarea = el.querySelector('textarea');
  if (!textarea) {
    return 0;
  }
  const lines = textarea.value.split('\n');
  return lines.length;
}

const Input = memo(
  ({ fileSpec, onFileUpload, onFileUploadError, onSubmit, onReply }: Props) => {
    const [attachments, setAttachments] = useRecoilState(attachmentsState);
    const setInputHistory = useSetRecoilState(inputHistoryState);
    const setChatSettingsOpen = useSetRecoilState(chatSettingsOpenState);
    const [currentMode, setCurrentMode] = useState<string | null>(() => {
      // Initialize from sessionStorage if available
      const mode = sessionStorage.getItem('copilot_mode');
      const timestamp = sessionStorage.getItem('copilot_mode_timestamp');

      // Only use the stored mode if it has a valid timestamp and is less than 5 minutes old
      // This handles cases where unload events didn't fire properly
      if (mode && timestamp && Date.now() - Number(timestamp) < 300000) {
        return mode;
      }

      // Otherwise clear stale data
      sessionStorage.removeItem('copilot_mode');
      sessionStorage.removeItem('copilot_mode_timestamp');
      return null;
    });
    const { session } = useChatSession();
    const socket = session?.socket;

    const ref = useRef<HTMLDivElement>(null);
    const {
      loading,
      askUser,
      chatSettingsInputs,
      disabled: _disabled
    } = useChatData();

    const [value, setValue] = useState('');
    const [isComposing, setIsComposing] = useState(false);

    const disabled = _disabled || !!attachments.find((a) => !a.uploaded);

    const { t } = useTranslation();

    // Listen for mode changes from the backend
    useEffect(() => {
      if (socket) {
        const handleModeChange = (data: { mode: string }) => {
          setCurrentMode(data.mode);
          // Store the mode in sessionStorage with a timestamp
          sessionStorage.setItem('copilot_mode', data.mode);
          // Add a timestamp to verify freshness on page reload
          sessionStorage.setItem(
            'copilot_mode_timestamp',
            Date.now().toString()
          );
        };

        const handlePageUnload = () => {
          // Clear mode when page unloads
          sessionStorage.removeItem('copilot_mode');
          sessionStorage.removeItem('copilot_mode_timestamp');
        };

        socket.on('copilot_mode', handleModeChange);
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

        return () => {
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
      }
    }, [socket]);

    // Helper function to check if features should be hidden based on mode
    const shouldHideFeature = useCallback(() => {
      return currentMode === 'mathpractice';
    }, [currentMode]);

    useEffect(() => {
      const pasteEvent = (event: ClipboardEvent) => {
        if (event.clipboardData && event.clipboardData.items) {
          const items = Array.from(event.clipboardData.items);
          items.forEach((item) => {
            if (item.kind === 'file') {
              const file = item.getAsFile();
              if (file) {
                onFileUpload([file]);
              }
            }
          });
        }
      };

      if (!ref.current) {
        return;
      }

      const input = ref.current;
      input.addEventListener('paste', pasteEvent);

      return () => {
        input.removeEventListener('paste', pasteEvent);
      };
    }, []);

    useEffect(() => {
      if (ref.current && !loading && !disabled) {
        ref.current.focus();
      }
    }, [loading, disabled]);

    const submit = useCallback(() => {
      if (value === '' || disabled) {
        return;
      }

      if (askUser) {
        onReply(value);
      } else {
        onSubmit(value, attachments);
      }

      setAttachments([]);
      setValue('');
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
        if (e.key === 'Enter' && !e.shiftKey) {
          if (!isComposing) {
            e.preventDefault();
            submit();
          }
        } else if (e.key === 'ArrowUp') {
          const lineCount = getLineCount(e.currentTarget as HTMLDivElement);
          if (lineCount <= 1) {
            setInputHistory((old) => ({ ...old, open: true }));
          }
        }
      },
      [submit, setInputHistory, isComposing]
    );

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
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
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
                    onSubmit={submit}
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
                  onFileUploadError={onFileUploadError}
                  onFileUpload={onFileUpload}
                />
              )}

              {chatSettingsInputs.length > 0 && (
                <IconButton
                  id="chat-settings-open-modal"
                  disabled={disabled}
                  color="inherit"
                  onClick={() => setChatSettingsOpen(true)}
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
