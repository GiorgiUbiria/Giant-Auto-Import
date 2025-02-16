import HeroImageComponent from "./hero-image";

export default async function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 min-h-[700px] text-white overflow-hidden">
      <HeroImageComponent />
      <div className="relative flex flex-col justify-center items-center h-full text-center px-4 py-20">
        <div className="w-max">
          <h1 className="animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-white pr-5 md:text-6xl lg:text-8xl text-4xl mb-6 text-white font-bold drop-shadow-lg">
            Giant Auto Import
          </h1>
        </div>
        <p className="text-xl text-gray-100 mb-10 max-w-2xl animate-fadeIn">
          Discover amazing features and services that await you.
        </p>
        <div className="flex gap-4 animate-fadeIn">
          <a href="#features" className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started
          </a>
          <a href="/docs" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
            Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
