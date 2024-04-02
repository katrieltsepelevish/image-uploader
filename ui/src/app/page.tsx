"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ImageUploader } from "@/components/image-uploader";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col gap-4 justify-center items-center p-8">
        <ImageUploader />
      </div>
    </QueryClientProvider>
  );
}
