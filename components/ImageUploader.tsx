import React, { useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { UploadedImage } from '../types';

interface ImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange }) => {
  
  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newImages: Promise<UploadedImage>[] = Array.from(files).map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            // Remove the Data URL prefix (e.g., "data:image/png;base64,") to get raw base64
            const result = e.target.result as string;
            const base64 = result.split(',')[1];
            
            resolve({
              id: Math.random().toString(36).substring(7),
              file,
              previewUrl: result,
              base64: base64,
              mimeType: file.type
            });
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImages).then((uploaded) => {
      onImagesChange([...images, ...uploaded]);
    });
  }, [images, onImagesChange]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    processFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const removeImage = (id: string) => {
    onImagesChange(images.filter(img => img.id !== id));
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer group bg-white"
      >
        <input
          type="file"
          id="fileInput"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
        <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
          <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">이미지 업로드</h3>
          <p className="text-sm text-gray-500 mt-2">
            클릭하여 선택하거나 이미지를 여기로 드래그하세요.<br />
            (누가기록 엑셀 스크린샷 등)
          </p>
        </label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {images.map((img) => (
            <div key={img.id} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
              <img
                src={img.previewUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate px-2">
                {img.file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
