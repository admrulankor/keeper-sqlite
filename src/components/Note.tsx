interface NoteProps {
  title: string;
  content: string;
  onDelete?: () => void;
  deleting?: boolean;
}

export default function Note({ title, content, onDelete, deleting = false }: NoteProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 m-2 hover:shadow-lg transition-shadow relative group flex flex-col w-full h-auto md:w-80">
      <h3 className="font-semibold text-lg mb-2 text-gray-800 pr-8 wrap-break-word">
        {title}
      </h3>
      <p className="text-gray-600 whitespace-pre-wrap wrap-break-word">
        {content}
      </p>
      {onDelete && (
        <button
          onClick={onDelete}
          disabled={deleting}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5"
          aria-label={deleting ? "Deleting note" : "Delete note"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
