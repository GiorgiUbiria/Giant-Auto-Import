import Link from "next/link";
import HeroImageComponent from "./hero-image";

export default async function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 h-[700px] text-white overflow-hidden">
      <HeroImageComponent />
      <div className="relative flex flex-col justify-center items-center h-full text-center">
        <div className="w-max">
          <h1 className="animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-white pr-5 md:text-6xl lg:text-8xl text-4xl mb-4 text-white font-bold">
           Giant Auto Import
          </h1>
        </div>
        <p className="text-lg text-gray-300 mb-8">
          Discover amazing features and services that await you.
        </p>
        <Link
          href="/"
          className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 py-2 px-6 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
