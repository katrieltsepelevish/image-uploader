import { BiError } from "react-icons/bi";

interface Props {
  message: string;
}

export const ErrorMessage = ({ message }: Props) => {
  return (
    <div
      className="flex items-center w-80 p-4 text-red-800 bg-red-50 dark:bg-gray-800 dark:text-red-400"
      role="alert"
    >
      <BiError className="flex-shrink-0 w-6 h-6" />
      <div className="ms-3 text-sm font-medium">{message}</div>
    </div>
  );
};
