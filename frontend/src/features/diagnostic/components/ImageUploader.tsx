import { useCallback, useState } from 'react';
import { CloudUpload, X, Camera } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  onClear?: () => void;
}

export function ImageUploader({ onFileSelect, selectedFile, onClear }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setPreview(null);
    onClear?.();
  };

  if (preview && selectedFile) {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-[#4caf50] bg-[#e8f5e9]">
        <img src={preview} alt="Aperçu" className="w-full h-48 object-cover" />
        <button
          onClick={handleClear}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-[#1a2e1d]" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm px-4 py-2">
          <p className="text-xs font-medium text-[#1a2e1d] truncate">{selectedFile.name}</p>
          <p className="text-xs text-[#6b7c6e]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-all',
        isDragging
          ? 'border-[#4caf50] bg-[#e8f5e9]'
          : 'border-[#e2e8e4]'
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f5e9]">
        <CloudUpload className="w-7 h-7 text-[#1a5c2a]" />
      </div>
      <p className="text-sm font-medium text-[#1a2e1d] text-center">Glissez-déposez votre image ici</p>
      <p className="text-xs text-[#6b7c6e]">ou</p>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <label className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#4caf50] text-[#1a5c2a] text-sm font-semibold cursor-pointer hover:bg-[#e8f5e9] transition-colors">
          <CloudUpload className="w-4 h-4" />
          Choisir une image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </label>

        <label className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a5c2a] text-white text-sm font-semibold cursor-pointer hover:bg-[#15803d] transition-colors">
          <Camera className="w-4 h-4" />
          Prendre une photo
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </label>
      </div>

      <p className="text-xs text-[#9aab9e] text-center">Formats acceptés : JPG, PNG (Max. 5Mo)</p>
    </div>
  );
}
