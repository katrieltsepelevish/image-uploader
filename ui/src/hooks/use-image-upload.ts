import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export enum JobStatus {
  WAITING = "waiting",
  DELAYED = "delayed",
  ACTIVE = "active",
  FAILED = "failed",
  COMPLETED = "completed",
}

const POLLING_INTERVAL = 500;

export const useImageUpload = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    try {
      setError(null);
      setJobId(null);
      setStatus(JobStatus.WAITING);
      setImageUrl(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${apiUrl}/upload-image`, {
        method: "POST",
        body: formData,
      });

      const { error, id } = await response.json();

      if (!response.ok) {
        setStatus(JobStatus.FAILED);
        setError(error);
      }

      setJobId(id);
    } catch (error) {
      setError(
        (error as Error).message ?? "Unexpected Internal Error has occurred"
      );
    }
  };

  const keepPolling =
    !!jobId &&
    ![JobStatus.FAILED, JobStatus.COMPLETED].includes(status as JobStatus);

  useQuery({
    queryKey: ["imageStatus", jobId],
    queryFn: async () => {
      try {
        if (!jobId) return;
        setError(null);

        const response = await fetch(`${apiUrl}/image/${jobId}`);
        const { status, imageUrl } = await response.json();
        setStatus(status);
        setImageUrl(imageUrl);
        return { status, imageUrl };
      } catch (error) {
        setError(`Error fetching image status: ${error}`);
      }
    },
    enabled: keepPolling,
    refetchInterval: POLLING_INTERVAL,
  });

  return { uploadImage, status, error, imageUrl };
};
