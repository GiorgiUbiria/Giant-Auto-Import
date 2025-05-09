import HeroImageComponent from "./hero-image";

export default async function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-black min-h-[700px] text-white overflow-hidden">
      <HeroImageComponent />
      <div className="relative flex flex-col justify-center items-center h-full text-center px-4 py-20">
        <div className="w-max">
          <h1 className="animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-white pr-5 md:text-6xl lg:text-8xl text-4xl mb-6 text-white font-bold drop-shadow-lg">
            Giant Auto Import
          </h1>
        </div>
        <p className="text-xl text-gray-100 mb-10 max-w-2xl animate-fadeIn">
          Your trusted partner in importing premium vehicles from Copart USA
        </p>
        <div className="flex gap-4 animate-fadeIn">
          <a href="#features" className="bg-white text-blue-600 dark:text-blue-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Start Importing
          </a>
          <a href="/how-to" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
            How It Works
          </a>
        </div>
      </div>
    </div>
  );
}
