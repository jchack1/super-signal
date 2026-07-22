import { useMutation, useQueryClient } from '@tanstack/react-query';
import { asMessageId, type Message, type NodeId } from '@super-signal/core';
import { dataLayer } from '../lib/data-layer';
import { CURRENT_AVATAR_ID } from '../lib/session';

// Posts a message to a channel with an optimistic update: the message appears
// instantly in the cached list, then reconciles once the write resolves (or rolls
// back on error). Same pattern will hold when the repository is Supabase.
export function useSendMessage(channelId: NodeId) {
  const queryClient = useQueryClient();
  const queryKey = ['messages', channelId] as const;

  return useMutation({
    mutationFn: (body: string) =>
      dataLayer.messages.create({ channelId, authorAvatarId: CURRENT_AVATAR_ID, body }),

    onMutate: async (body: string) => {
      // Stop in-flight refetches so they don't clobber our optimistic entry.
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Message[]>(queryKey);

      const optimistic: Message = {
        id: asMessageId(`optimistic-${crypto.randomUUID()}`),
        channelId,
        authorAvatarId: CURRENT_AVATAR_ID,
        body,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<Message[]>(queryKey, (old = []) => [...old, optimistic]);

      return { previous };
    },

    onError: (_error, _body, context) => {
      // Roll back to the pre-optimistic list.
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },

    onSettled: () => {
      // Re-sync with the source of truth (swaps the optimistic id for the real one).
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
