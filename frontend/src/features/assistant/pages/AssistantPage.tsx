import { useState, useRef, useEffect, useId } from 'react';
import { Send, Plus, MessageCircle, PanelLeft, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { timeAgo, formatDate } from '@/utils/formatDate';
import { useConversations, useMessages, useSendMessage } from '../hooks/useAssistant';
import { getApiErrorMessage } from '@/lib/apiError';
import toast from 'react-hot-toast';
import type { Message } from '../types';

const quickSuggestions = [
  'Comment traiter la rouille du maïs ?',
  'Engrais recommandé pour le maïs',
  'Calendrier cultural du maïs',
];

export function AssistantPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const msgId = useId();

  const { data: conversations = [] } = useConversations();
  const { data: fetchedMessages = [] } = useMessages(conversationId);
  const sendMessage = useSendMessage();

  // Synchronise l'état local avec les messages récupérés du serveur
  // à chaque changement de conversation.
  useEffect(() => {
    setLocalMessages(fetchedMessages);
  }, [fetchedMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages, sendMessage.isPending]);

  const handleSend = (text?: string) => {
    const content = text ?? input.trim();
    if (!content || sendMessage.isPending) return;

    const optimisticId = `${msgId}-${Date.now()}`;
    const optimisticUserMsg: Message = {
      id: optimisticId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, optimisticUserMsg]);
    setInput('');

    sendMessage.mutate(
      { conversation_id: conversationId ?? undefined, content },
      {
        onSuccess: (data) => {
          if (!conversationId) setConversationId(data.conversation.id);
          setLocalMessages((prev) => [...prev, data.message]);
        },
        onError: (error) => {
          setLocalMessages((prev) => prev.filter((m) => m.id !== optimisticId));
          toast.error(getApiErrorMessage(error, "Erreur lors de l'envoi du message."));
        },
      }
    );
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setLocalMessages([]);
    setListOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const conversationList = (
    <>
      <div className="p-4 border-b border-[#e2e8e4]">
        <h2 className="font-semibold text-[#1a2e1d] mb-3">Conversations</h2>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full"
          onClick={handleNewConversation}
        >
          Nouvelle conversation
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[#e2e8e4]">
        {conversations.length === 0 && (
          <p className="text-xs text-[#9aab9e] text-center px-4 py-6">
            Aucune conversation pour l'instant. Posez votre première question !
          </p>
        )}
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => { setConversationId(conv.id); setListOpen(false); }}
            className={cn(
              'w-full text-left px-4 py-3 hover:bg-[#f7f9f7] transition-colors',
              conversationId === conv.id && 'bg-[#e8f5e9]'
            )}
          >
            <p className={cn('text-sm font-medium truncate', conversationId === conv.id ? 'text-[#1a5c2a]' : 'text-[#1a2e1d]')}>
              {conv.title}
            </p>
            <p className="text-xs text-[#6b7c6e] truncate mt-0.5">{conv.last_message}</p>
            <p className="text-xs text-[#9aab9e] mt-0.5">{formatDate(conv.updated_at)}</p>
          </button>
        ))}
      </div>
    </>
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-5 min-w-0">
      {/* Overlay mobile pour la liste des conversations */}
      {listOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setListOpen(false)} />
      )}

      {/* Sidebar conversations : tiroir en dessous de lg, colonne fixe au-dessus */}
      <Card
        padding="none"
        className={cn(
          'w-72 shrink-0 flex flex-col z-50',
          'fixed inset-y-4 left-4 md:static md:inset-auto md:z-auto transition-transform duration-300 ease-in-out',
          listOpen ? 'translate-x-0' : '-translate-x-[calc(100%+2rem)] md:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between p-2 md:hidden">
          <span className="text-xs font-medium text-[#9aab9e] pl-2">Conversations</span>
          <button onClick={() => setListOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-[#6b7c6e]" />
          </button>
        </div>
        {conversationList}
      </Card>

      {/* Zone de chat */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setListOpen(true)}
            className="md:hidden shrink-0 p-2 rounded-lg border border-[#e2e8e4] text-[#1a5c2a] hover:bg-[#e8f5e9] transition-colors"
            aria-label="Voir les conversations"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#1a2e1d]">Assistant IA</h1>
            <p className="text-sm text-[#6b7c6e]">Posez vos questions agricoles et obtenez des conseils personnalisés.</p>
          </div>
        </div>

        <Card padding="none" className="flex flex-1 flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {localMessages.length === 0 && !sendMessage.isPending && (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#6b7c6e]">
                <MessageCircle className="w-10 h-10 text-[#4caf50] mb-3" />
                <p className="text-sm">Posez une question sur vos cultures, vos animaux ou l'agriculture en général.</p>
              </div>
            )}
            {localMessages.map((msg) => (
              <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a5c2a] text-white text-sm shrink-0 mr-2 mt-1">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-[#1a5c2a] text-white rounded-tr-sm'
                      : 'bg-[#f7f9f7] text-[#1a2e1d] rounded-tl-sm border border-[#e2e8e4]'
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={cn('text-xs mt-1.5', msg.role === 'user' ? 'text-white/60 text-right' : 'text-[#9aab9e]')}>
                    {timeAgo(msg.created_at)}
                  </p>
                </div>
              </div>
            ))}

            {sendMessage.isPending && (
              <div className="flex justify-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a5c2a] text-white mr-2 mt-1">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="bg-[#f7f9f7] border border-[#e2e8e4] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="h-2 w-2 rounded-full bg-[#4caf50] animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions rapides */}
          {localMessages.length === 0 && (
            <div className="flex gap-2 flex-wrap px-5 pb-3">
              {quickSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-xs border border-[#4caf50] text-[#1a5c2a] rounded-full px-3 py-1.5 hover:bg-[#e8f5e9] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-[#e2e8e4] p-4 flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre message…"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-[#e2e8e4] bg-[#f7f9f7] px-4 py-2.5 text-sm text-[#1a2e1d] placeholder:text-[#9aab9e] focus:border-[#1a5c2a] focus:ring-2 focus:ring-[#1a5c2a]/20 outline-none max-h-32 overflow-y-auto"
              style={{ height: 'auto' }}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || sendMessage.isPending}
              className="shrink-0"
              size="md"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
