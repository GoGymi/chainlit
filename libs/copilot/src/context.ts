import { createContext } from 'react';

export interface WidgetProps {
  chainlitServer: string;
  accessToken?: string;
  theme?: 'light' | 'dark';
}

interface IWidgetContext extends WidgetProps {}

const defaultContext: WidgetProps = {
  chainlitServer: '',
  accessToken: undefined,
  theme: 'light'
};

const WidgetContext = createContext<IWidgetContext>(defaultContext);

export { WidgetContext, defaultContext };
