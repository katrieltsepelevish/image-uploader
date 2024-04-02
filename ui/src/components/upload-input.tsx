"use client";
import { useMemo, ChangeEvent } from "react";
import { ImSpinner } from "react-icons/im";
import { MdOutlineImage } from "react-icons/md";
import { BiError } from "react-icons/bi";
import { FaCloud } from "react-icons/fa";

import { JobStatus } from "@/hooks/use-image-upload";

interface Status {
  icon: React.ReactElement;
  title: string;
  description: string;
  condition: boolean;
}

interface Props {
  status: JobStatus | null;
  onChange: (file: File | undefined) => void;
}

export const UploadInput = ({ status, onChange }: Props) => {
  const statuses: Status[] = useMemo(
    () => [
      {
        icon: <FaCloud className="w-8 h-8 mb-2" />,
        title: "Upload file",
        description: "PNG, JPG, SVG, WEBP, and GIF are Allowed.",
        condition: !status,
      },
      {
        icon: <ImSpinner className="w-8 h-8 mb-2 animate-spin" />,
        title: "Uploading...",
        description: `Status: ${status}`,
        condition: [
          JobStatus.WAITING,
          JobStatus.DELAYED,
          JobStatus.ACTIVE,
        ].includes(status as JobStatus),
      },
      {
        icon: <BiError className="w-8 h-8 mb-2 fill-red-500" />,
        title: "Ooops..",
        description: "Something went wrong, please try again.",
        condition: status === JobStatus.FAILED,
      },
      {
        icon: <MdOutlineImage className="w-8 h-8 mb-2" />,
        title: "Awesome!",
        description: "Uploaded succesfully...",
        condition: status === JobStatus.COMPLETED,
      },
    ],
    [status]
  );

  const activeStatus = statuses.find(({ condition }) => condition);

  const isDisabled =
    !!status &&
    ![JobStatus.COMPLETED, JobStatus.FAILED].includes(status as JobStatus);

  return (
    <label
      className={`bg-white text-black text-base w-80 h-52 flex flex-col items-center justify-center ${
        isDisabled ? "cursor-not-allowed" : "cursor-pointer"
      } border-2 border-gray-300 border-dashed mx-auto font-[sans-serif]`}
    >
      {activeStatus?.icon}
      {activeStatus?.title}
      <input
        type="file"
        id="upload"
        className="hidden"
        disabled={isDisabled}
        multiple={false}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          event.preventDefault();
          const files = event.target.files;
          const file = files?.[0];
          onChange(file);
        }}
      />
      <p className="text-xs text-gray-400 mt-2">{activeStatus?.description}</p>
    </label>
  );
};
