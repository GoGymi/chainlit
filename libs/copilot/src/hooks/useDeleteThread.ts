import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { toast } from 'sonner';

import { ChainlitContext, accessTokenState } from '@chainlit/react-client';

export const useDeleteThread = () => {
  const apiClient = useContext(ChainlitContext);
  const accessToken = useRecoilValue(accessTokenState);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (threadId: string) =>
      apiClient.deleteThread(threadId, accessToken),

    onSuccess: () => {
      // Invalidate and refetch all thread queries
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      toast.success('Conversation deleted');
    },

    onError: (error) => {
      toast.error('Failed to delete conversation');
      console.error('Delete thread error:', error);
    }
  });
};
