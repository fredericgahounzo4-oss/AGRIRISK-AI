import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, PanelLeft, X, Store, User as UserIcon, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { useAuthStore } from '@/features/auth/store/authStore';
import { cn } from '@/utils/cn';
import { timeAgo } from '@/utils/formatDate';
import { getApiErrorMessage } from '@/lib/apiError';
import { useThreads, useThreadMessages, useSendDirectMessage } from '../hooks/useMessages';

/** Messagerie agriculteur ↔ fournisseur — même page pour les deux portails. */
export function MessagesPage() {
  const user = useAuthStore((s) => s.user);
  const [params, setParams] = useSearchParams();
  const activeId = params.get('thread');
  const [input, setInput] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: threads = [], isLoading } = useThreads();
  const { data: conversation, isLoading: loadingMessages } = useThreadMessages(activeId);
  const send = useSendDirectMessage();

  const messages = conversation?.messages ?? [];
  const activeThread = threads.find((t) => t.id === activeId) ?? conversation?.thread;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeId]);

  const openThread = (id: string) => {
    setParams({ thread: id });
    setListOpen(false);
  };

  const handleSend = () => {
    const content = input.trim();
    if (!content || !activeId || send.isPending) return;
    send.mutate(
      { threadId: activeId, content },
      {
        onSuccess: () => setInput(''),
        onError: (error) => toast.error(getApiErrorMessage(error, "Impossible d'envoyer le message.")),
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const OtherIcon = user?.role === 'supplier' ? UserIcon : Store;

  const threadList = (
    <>
      <div className="p-4 border-b border-[#e2e8e4]">
        <h2 className="font-semibold text-[#1a2e1d]">Discussions</h2>
        <p className="text-xs text-[#6b7c6e] mt-0.5">
          {user?.role === 'supplier' ? 'Vos échanges avec les agriculteurs' : 'Vos échanges avec les fournisseurs'}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-[#e2e8e4]">
        {isLoading && <div className="p-6"><Loader /></div>}
        {!isLoading && threads.length === 0 && (
          <p className="text-xs text-[#9aab9e] text-center px-4 py-8">
            {user?.role === 'supplier'
              ? "Aucun message pour l'instant. Les agriculteurs peuvent vous écrire depuis vos produits."
              : 'Aucune discussion. Utilisez le bouton « Message » sur un produit de la boutique ou sur la carte des fournisseurs.'}
          </p>
        )}
        {threads.map((t) => (
          <button
            key={t.id}
            onClick={() => openThread(t.id)}
            className={cn(
              'w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-[#f7f9f7] transition-colors',
              activeId === t.id && 'bg-[#e8f5e9]'
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f5e9] shrink-0 overflow-hidden">
              {t.other_avatar
                ? <img src={t.other_avatar} alt="" className="h-full w-full object-cover" />
                : <OtherIcon className="w-5 h-5 text-[#1a5c2a]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#1a2e1d] truncate">{t.other_name}</p>
                <span className="text-[10px] text-[#9aab9e] shrink-0">{timeAgo(t.last_message_at)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className={cn('text-xs truncate', t.unread_count > 0 ? 'text-[#1a2e1d] font-medium' : 'text-[#6b7c6e]')}>
                  {t.last_message}
                </p>
                {t.unread_count > 0 && (
                  <span className="h-5 min-w-5 px-1.5 rounded-full bg-[#22c55e] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {t.unread_count}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-5 min-w-0">
      {listOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setListOpen(false)} />}

      <Card
        padding="none"
        className={cn(
          'w-80 shrink-0 flex flex-col z-50',
          'fixed inset-y-4 left-4 md:static md:inset-auto md:z-auto transition-transform duration-300 ease-in-out',
          listOpen ? 'translate-x-0' : '-translate-x-[calc(100%+2rem)] md:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between p-2 md:hidden">
          <span className="text-xs font-medium text-[#9aab9e] pl-2">Discussions</span>
          <button onClick={() => setListOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100" aria-label="Fermer">
            <X className="w-4 h-4 text-[#6b7c6e]" />
          </button>
        </div>
        {threadList}
      </Card>

      <div className="flex flex-1 flex-col min-w-0">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setListOpen(true)}
            className="md:hidden shrink-0 p-2 rounded-lg border border-[#e2e8e4] text-[#1a5c2a] hover:bg-[#e8f5e9] transition-colors"
            aria-label="Voir les discussions"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#1a2e1d]">Messages</h1>
            <p className="text-sm text-[#6b7c6e] truncate">
              {activeThread ? `Discussion avec ${activeThread.other_name}` : 'Sélectionnez une discussion.'}
            </p>
          </div>
        </div>

        <Card padding="none" className="flex flex-1 flex-col overflow-hidden">
          {!activeId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-[#6b7c6e] p-6">
              <MessageSquare className="w-10 h-10 text-[#4caf50] mb-3" />
              <p className="text-sm">Choisissez une discussion pour afficher les messages.</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {loadingMessages && messages.length === 0 && <Loader />}
                {messages.map((m) => {
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                          mine
                            ? 'bg-[#1a5c2a] text-white rounded-tr-sm'
                            : 'bg-[#f7f9f7] text-[#1a2e1d] rounded-tl-sm border border-[#e2e8e4]'
                        )}
                      >
                        {m.product_name && (
                          <p className={cn(
                            'flex items-center gap-1.5 text-xs mb-1.5 pb-1.5 border-b',
                            mine ? 'border-white/20 text-white/80' : 'border-[#e2e8e4] text-[#6b7c6e]'
                          )}>
                            <Package className="w-3.5 h-3.5" /> {m.product_name}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        <p className={cn('text-[10px] mt-1', mine ? 'text-white/60 text-right' : 'text-[#9aab9e]')}>
                          {timeAgo(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-[#e2e8e4] p-4 flex gap-3 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Écrivez votre message…"
                  rows={1}
                  maxLength={2000}
                  className="flex-1 resize-none rounded-xl border border-[#e2e8e4] bg-[#f7f9f7] px-4 py-2.5 text-sm text-[#1a2e1d] placeholder:text-[#9aab9e] focus:border-[#1a5c2a] focus:ring-2 focus:ring-[#1a5c2a]/20 outline-none max-h-32 overflow-y-auto"
                />
                <Button onClick={handleSend} disabled={!input.trim() || send.isPending} className="shrink-0" aria-label="Envoyer">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
