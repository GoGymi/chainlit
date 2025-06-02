import { makeApiClient } from 'api';
import App from 'app';
import { WidgetContext, WidgetProps } from 'context';
import { useEffect } from 'react';
import { RecoilRoot } from 'recoil';

import { ChainlitContext } from '@chainlit/react-client';

export default function AppWrapper(props: { widgetConfig: WidgetProps }) {
  // Debug: Log all received props
  console.log('[Copilot AppWrapper] Received props:', props);

  const { widgetConfig } = props;

  // Use chainlitServer from widgetConfig
  const serverUrl = widgetConfig.chainlitServer;

  if (!serverUrl) {
    console.error(
      '[Copilot AppWrapper] chainlitServer is required but not provided'
    );
    return <div>Error: Chainlit server configuration missing</div>;
  }

  const apiClient = makeApiClient(serverUrl);

  useEffect(() => {
    console.log('[Copilot AppWrapper] Initializing copilot with config:', {
      chainlitServer: widgetConfig.chainlitServer,
      accessToken: widgetConfig.accessToken ? '***' : 'none',
      theme: widgetConfig.theme
    });
  }, [widgetConfig]);

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
