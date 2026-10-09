import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { getApiErrorMessage } from '@/lib/apiError';
import { useStartThread } from '../hooks/useMessages';

interface Props {
  supplierId: string;
  supplierName: string;
  productId?: string;
  productName?: string;
  onClose: () => void;
}

/** Fenêtre « Écrire au fournisseur » : envoie un premier message puis ouvre la discussion. */
export function ContactSupplierModal({ supplierId, supplierName, productId, productName, onClose }: Props) {
  const navigate = useNavigate();
  const start = useStartThread();
  const [content, setContent] = useState(
    productName ? `Bonjour, je suis intéressé(e) par « ${productName} ». Est-il disponible ?` : 'Bonjour, '
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSend = () => {
    const text = content.trim();
    if (!text) return;
    start.mutate(
      { supplier_id: supplierId, product_id: productId, content: text },
      {
        onSuccess: ({ thread }) => {
          toast.success('Message envoyé');
          onClose();
          navigate(`/app/messages?thread=${thread.id}`);
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Impossible d'envoyer le message.")),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-[#e2e8e4] overflow-hidden">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-[#e2e8e4]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5e9] shrink-0">
              <MessageSquare className="w-5 h-5 text-[#1a5c2a]" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-[#1a2e1d]">Écrire au fournisseur</h2>
              <p className="text-xs text-[#6b7c6e] truncate">{supplierName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100" aria-label="Fermer">
            <X className="w-4 h-4 text-[#6b7c6e]" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {productName && (
            <p className="text-xs rounded-lg bg-[#f7f9f7] border border-[#e2e8e4] px-3 py-2 text-[#6b7c6e]">
              À propos de : <span className="font-medium text-[#1a2e1d]">{productName}</span>
            </p>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={2000}
            autoFocus
            className="w-full resize-none rounded-xl border border-[#e2e8e4] bg-[#f7f9f7] px-4 py-3 text-sm text-[#1a2e1d] focus:border-[#1a5c2a] focus:ring-2 focus:ring-[#1a5c2a]/20 outline-none"
            placeholder="Posez votre question au fournisseur…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Annuler</Button>
            <Button onClick={handleSend} loading={start.isPending} disabled={!content.trim()}
              leftIcon={<Send className="w-4 h-4" />}>
              Envoyer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
