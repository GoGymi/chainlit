import { toast } from 'sonner';

import { ChainlitAPI, ClientError } from '@chainlit/react-client';

export function makeApiClient(chainlitServer: string) {
  const httpEndpoint = chainlitServer;
  const username = sessionStorage.getItem('username');

  const on401 = () => {
    toast.error('Unauthorized');
  };

  const onError = (error: ClientError) => {
    toast.error(error.toString());
  };

  // Create API client with default headers
  const client = new ChainlitAPI(httpEndpoint, 'copilot', on401, onError);

  // Set default headers if username exists
  if (username) {
    client.setDefaultHeaders({
      Authorization: username
    });
  }

  return client;
}
