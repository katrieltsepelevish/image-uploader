import { useImageUpload } from "@/hooks/use-image-upload";
import { UploadInput } from "@/components/upload-input";
import { ErrorMessage } from "@/components/error-message";
import { ImagePreview } from "@/components/image-preview";

export const ImageUploader = () => {
  const { uploadImage, status, error, imageUrl } = useImageUpload();

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;
    await uploadImage(file);
  };

  return (
    <div className="flex flex-col gap-2 justify-center items-center p-8">
      <UploadInput onChange={handleFileUpload} status={status} />
      {!!error && <ErrorMessage message={error} />}
      {imageUrl && <ImagePreview imageUrl={imageUrl} />}
    </div>
  );
};
