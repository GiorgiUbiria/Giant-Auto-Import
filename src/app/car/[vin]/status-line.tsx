"use client";

import { HomeIcon } from "lucide-react";
import { useMedia } from "react-use";

interface StatusLineProps {
  status: string;
}

interface Status {
  status: string;
  index: number;
  icon: React.ReactNode;
}

const statuses: Status[] = [
  { status: "Pending", index: 0, icon: <HomeIcon /> },
  { status: "OnHand", index: 1, icon: <HomeIcon /> },
  { status: "Loaded", index: 2, icon: <HomeIcon /> },
  { status: "InTransit", index: 3, icon: <HomeIcon /> },
  { status: "Fault", index: 4, icon: <HomeIcon /> },
];

const StatusLine: React.FC<StatusLineProps> = ({ status }) => {
  const currentStatusIndex = statuses.findIndex((s) => s.status === status);
  const isLastStatus = currentStatusIndex === statuses.length - 1;
  const progressPercentage = ((currentStatusIndex + 1) / statuses.length) * 100;

  // Detect if the device is a mobile based on screen width
  const isMobile = useMedia(`(max-width: 1280px)`);

  // Find the current status object
  const currentStatus = statuses.find((s) => s.status === status);

  return (
    <div className="w-full px-24 py-4">
      {/* Mobile display: Show only the current status node */}
      {isMobile && currentStatus && (
        <div className="flex justify-center">
          <div
            className={`flex w-24 h-14 font-bold text-white p-6 transition-all duration-300 bg-${
              isLastStatus ? "green-500" : "blue-500"
            } rounded-full justify-center items-center transform scale-110`}
          >
            {currentStatus.icon}
            <div className="absolute -bottom-[1.5rem] w-max text-center">
              <p className="block font-sans text-base antialiased leading-relaxed text-gray-700 font-bold">
                {currentStatus.status}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop display: Show full status line */}
      {!isMobile && (
        <div className="relative flex items-center justify-between w-full">
          {/* Static background line */}
          <div className="absolute left-0 top-2/4 h-0.5 w-full -translate-y-2/4 bg-gray-300"></div>
          {/* Dynamic completed portion of the line */}
          <div
            className={`absolute left-0 top-2/4 h-0.5 w-${progressPercentage}% -translate-y-2/4 ${
              currentStatusIndex === statuses.length - 1
                ? "bg-green-500"
                : "bg-blue-500"
            } transition-all duration-500`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
          {/* Status nodes */}
          {statuses.map((status, index) => (
            <div
              key={index}
              className={`relative z-10 grid w-${isLastStatus ? "14" : index <= currentStatusIndex ? "14" : "10"} h-${isLastStatus ? "14" : index <= currentStatusIndex ? "14" : "10"} font-bold text-white transition-all duration-300 bg-${
                isLastStatus
                  ? "green-500"
                  : index <= currentStatusIndex
                    ? "blue-500"
                    : "gray-900"
              } rounded-full place-items-center transform scale-${index === currentStatusIndex ? "110" : "100"}`}
            >
              {status.icon}
              <div className="absolute -bottom-[1.5rem] w-max text-center">
                <p className="block font-sans text-base antialiased leading-relaxed text-gray-700 font-bold">
                  {status.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusLine;
