"use client";

import { Warehouse, Ship, Gavel, Truck, Container, CircleCheckBig } from "lucide-react";
import { useMedia } from "react-use";
import { useState, useEffect } from "react";

interface StatusLineProps {
  status: string;
}

interface Status {
  status: string;
  name: string;
  index: number;
  icon: React.ReactNode;
}

const statuses: Status[] = [
  { status: "AUCTION", name: "Auction", index: 0, icon: <Gavel className="invert dark:invert-0" /> },
  { status: "INNER_TRANSIT", name: "In Transit", index: 1, icon: <Truck className="invert dark:invert-0" /> },
  { status: "WAREHOUSE", name: "Warehouse", index: 2, icon: <Warehouse className="invert dark:invert-0" /> },
  { status: "LOADED", name: "Loaded", index: 3, icon: <Container className="invert dark:invert-0" /> },
  { status: "SAILING", name: "Sailing", index: 4, icon: <Ship className="invert dark:invert-0" /> },
  { status: "DELIVERED", name: "Delivered", index: 5, icon: <CircleCheckBig className="invert dark:invert-0" /> },
];

const StatusLine: React.FC<StatusLineProps> = ({ status }) => {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(-1);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isLastStatus, setIsLastStatus] = useState(false);

  useEffect(() => {
    const index = statuses.findIndex((s) => s.status === status);
    setCurrentStatusIndex(index);
    setIsLastStatus(index === statuses.length - 1);
    setProgressPercentage(((index + 1) / statuses.length) * 100);
  }, [status]);

  const isMobile = useMedia(`(max-width: 1280px)`, true);

  const currentStatus = statuses.find((s) => s.status === status);

  return (
    <div className="w-full py-4">
      {isMobile && currentStatus && (
        <div className="flex flex-col items-center">
          <div
            className={`flex w-16 h-16 font-bold text-white p-4 transition-all duration-300 ${
              isLastStatus ? "bg-green-500" : "bg-blue-500"
            } rounded-full justify-center items-center transform scale-110`}
          >
            <span>{currentStatus.icon}</span>
          </div>
          <div className="mt-2 text-center">
            <p className="block font-sans text-base antialiased leading-relaxed text-primary font-bold">
              {currentStatus.name}
            </p>
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="relative flex items-center justify-between w-full">
          <div className="absolute left-0 top-2/4 h-0.5 w-full -translate-y-2/4 dark:bg-gray-700 bg-gray-300"></div>
          <div
            className={`absolute left-0 top-2/4 h-0.5 -translate-y-2/4 ${
              isLastStatus ? "bg-green-500" : "bg-blue-500"
            } transition-all duration-500`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
          {statuses.map((statusItem, index) => (
            <div
              key={index}
              className={`relative z-10 grid font-bold text-white transition-all duration-300 rounded-full place-items-center ${
                isLastStatus || index <= currentStatusIndex
                  ? "w-14 h-14"
                  : "w-10 h-10"
              } ${
                isLastStatus
                  ? "bg-green-500"
                  : index <= currentStatusIndex
                  ? "bg-blue-500"
                  : "bg-gray-300 dark:bg-gray-700"
              } ${index === currentStatusIndex ? "transform scale-110" : ""}`}
            >
              {statusItem.icon}
              <div className="absolute -bottom-[1.75rem] w-max text-center">
                <p className="block font-sans text-base antialiased leading-relaxed text-primary font-bold">
                  {statusItem.name}
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