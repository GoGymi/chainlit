import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import React from 'react';
import ReactDOM from 'react-dom/client';

// @ts-expect-error inlined
import clStyles from '@chainlit/app/src/App.css?inline';
import { IStep } from '@chainlit/react-client';

// @ts-expect-error inlined
import sonnerCss from './sonner.css?inline';
// @ts-expect-error inlined
import hljsStyles from 'highlight.js/styles/monokai-sublime.css?inline';

import AppWrapper from './src/appWrapper';
import { i18nSetupLocalization } from './src/i18n';
import { IWidgetConfig } from './src/types';

const id = 'chainlit-copilot';
let root: ReactDOM.Root | null = null;

declare global {
  interface Window {
    cl_shadowRootElement: HTMLDivElement;
    mountChainlitWidget: (config: IWidgetConfig) => void;
    unmountChainlitWidget: () => void;
    sendChainlitMessage: (message: IStep) => void;
  }
}

window.mountChainlitWidget = (config: IWidgetConfig) => {
  // Validate configuration
  if (!config || !config.chainlitServer) {
    console.error(
      '[Copilot] Invalid widget configuration. chainlitServer is required.'
    );
    return;
  }

  console.log('[Copilot] Mounting widget with config:', {
    chainlitServer: config.chainlitServer,
    accessToken: config.accessToken ? '***' : 'none'
  });
  console.log('[Copilot] Full props received:', config);

  // Initialize i18n before mounting the widget
  i18nSetupLocalization();

  const container = document.createElement('div');
  container.id = id;
  document.body.appendChild(container);

  const shadowContainer = container.attachShadow({ mode: 'open' });
  const shadowRootElement = document.createElement('div');
  shadowRootElement.id = 'cl-shadow-root';
  shadowContainer.appendChild(shadowRootElement);

  const cache = createCache({
    key: 'css',
    prepend: true,
    container: shadowContainer
  });

  window.cl_shadowRootElement = shadowRootElement;

  root = ReactDOM.createRoot(shadowRootElement);
  root.render(
    <React.StrictMode>
      <CacheProvider value={cache}>
        <style type="text/css">
          {`
            ${clStyles}
            ${hljsStyles}
            ${sonnerCss}

            .katex-html {
              display: none;
            }
          `}
        </style>
        <AppWrapper widgetConfig={config} />
      </CacheProvider>
    </React.StrictMode>
  );
};

window.unmountChainlitWidget = () => {
  // Explicitly clear copilot_mode from sessionStorage when widget is unmounted
  sessionStorage.removeItem('copilot_mode');
  sessionStorage.removeItem('copilot_mode_timestamp');
  root?.unmount();
};

window.sendChainlitMessage = () => {
  console.info('Copilot is not active. Please check if the widget is mounted.');
};
