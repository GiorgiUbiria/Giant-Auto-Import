import { FileWarning } from "lucide-react";

export default function StatusLine() {
  const steps = [
    { status: "In Transit", description: "Your package is on the way" },
    { status: "Warehouse", description: "Your package is in the warehouse" },
    { status: "Sailing", description: "Your package is sailing" },
    { status: "Delivered", description: "Your package has been delivered" },
  ];

  return (
    <ul className="relative flex flex-row gap-x-2">
      <li className="flex items-center gap-x-2 shrink basis-0 flex-1 group">
        <div className="min-w-7 min-h-7 inline-flex justify-center items-center text-xs align-middle">
          <img
            className="flex-shrink-0 size-7 rounded-full"
            src="https://images.unsplash.com/photo-1659482633369-9fe69af50bfb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8auto=format&fit=facearea&facepad=3&w=320&h=320&q=80"
            alt="Image Description"
          />
          <span className="ms-2 block text-sm font-medium text-gray-800 dark:text-white">
            Step
          </span>
        </div>
        <div className="w-full h-px flex-1 bg-gray-200 group-last:hidden dark:bg-neutral-700"></div>
      </li>
      <li className="flex items-center gap-x-2 shrink basis-0 flex-1 group">
        <div className="min-w-7 min-h-7 inline-flex justify-center items-center text-xs align-middle">
          <span className="size-7 flex justify-center items-center flex-shrink-0 bg-white border border-gray-200 font-medium text-gray-800 rounded-full dark:bg-neutral-900 dark:border-neutral-700 dark:text-white">
            <svg
              className="flex-shrink-0 size-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M16 3h5v5"></path>
              <path d="M8 3H3v5"></path>
              <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"></path>
              <path d="m15 9 6-6"></path>
            </svg>
          </span>
          <span className="ms-2 block text-sm font-medium text-gray-800 dark:text-white">
            Step
          </span>
        </div>
        <div className="w-full h-px flex-1 bg-gray-200 group-last:hidden dark:bg-neutral-700"></div>
      </li>
      <li className="flex items-center gap-x-2 shrink basis-0 flex-1 group">
        <div className="min-w-7 min-h-7 inline-flex justify-center items-center text-xs align-middle">
          <span className="size-7 flex justify-center items-center flex-shrink-0 bg-white border border-gray-200 font-medium text-gray-800 rounded-full dark:bg-neutral-900 dark:border-neutral-700 dark:text-white">
            <span
              className="animate-spin inline-block size-4 border-[3px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500"
              role="status"
              aria-label="loading"
            >
              <span className="sr-only">Loading...</span>
            </span>
          </span>
          <span className="ms-2 block text-sm font-medium text-gray-800 dark:text-white">
            Step
          </span>
        </div>
        <div className="w-full h-px flex-1 bg-gray-200 group-last:hidden dark:bg-neutral-700"></div>
      </li>
      <li>
        <FileWarning className="w-8 h-8" />
      </li>
    </ul>
  );
}
