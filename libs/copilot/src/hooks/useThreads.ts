import { useInfiniteQuery } from '@tanstack/react-query';
import { useContext, useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { ChainlitContext, accessTokenState } from '@chainlit/react-client';

import { groupByDate } from '../utils/group';

const BATCH_SIZE = '20';

export const useThreads = () => {
  const apiClient = useContext(ChainlitContext);
  const accessToken = useRecoilValue(accessTokenState);

  const query = useInfiniteQuery({
    queryKey: ['threads'],
    queryFn: async ({ pageParam }) => {
      const { pageInfo, data } = await apiClient.listThreads(
        { first: BATCH_SIZE, cursor: pageParam ?? '0' },
        accessToken
      );
      return { threads: data, pageInfo };
    },
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.endCursor : undefined,
    initialPageParam: undefined,
    enabled: !!accessToken,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5 // 5 minutes (garbage collection time)
  });

  // Transform data to match old interface
  const threadHistory = useMemo(() => {
    if (!query.data) return undefined;

    const allThreads = query.data.pages.flatMap((page) => page.threads);

    return {
      threads: allThreads,
      timeGroupedThreads: groupByDate(allThreads),
      pageInfo: query.data.pages[query.data.pages.length - 1]?.pageInfo
    };
  }, [query.data]);

  return {
    threadHistory,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    error: query.error?.message,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage || false,
    refetch: query.refetch
  };
};
