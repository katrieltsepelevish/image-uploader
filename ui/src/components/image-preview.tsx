interface Props {
  imageUrl: string;
}

export const ImagePreview = ({ imageUrl }: Props) => {
  return (
    <div>
      {/* eslint-disable-next-line */}
      <img src={imageUrl} className="w-80 h-40" />
      <a
        href={imageUrl}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 mt-2 inline-flex items-center"
      >
        <span className="w-full text-center">View image</span>
      </a>
    </div>
  );
};
