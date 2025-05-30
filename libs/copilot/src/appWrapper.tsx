import { makeApiClient } from 'api';
import App from 'app';
import { WidgetContext, WidgetProps } from 'context';
import { useEffect } from 'react';
import { RecoilRoot } from 'recoil';

import { ChainlitContext } from '@chainlit/react-client';

export default function AppWrapper(props: WidgetProps) {
  const apiClient = makeApiClient(props.chainlitServer);

  useEffect(() => {
    console.log('[Copilot AppWrapper] Initializing copilot with config:', {
      chainlitServer: props.chainlitServer,
      accessToken: props.accessToken ? '***' : 'none',
      theme: props.theme
    });
  }, [props]);

  return (
    <RecoilRoot>
      <WidgetContext.Provider value={props}>
        <ChainlitContext.Provider value={apiClient}>
          <App widgetConfig={props} />
        </ChainlitContext.Provider>
      </WidgetContext.Provider>
    </RecoilRoot>
  );
}
