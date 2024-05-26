export default async function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to the Jungle
          </h1>
          <p className="text-xl text-white mb-8">Where the adventure begins!</p>
          <a
            href="#"
            className="bg-white text-purple-900 py-2 px-4 rounded-full hover:bg-indigo-500 hover:text-white transition duration-300 ease-in-out"
          >
            Get Started
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-purple-900 mb-4">
              Explore the Wild
            </h2>
            <p className="text-gray-700">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum nec mi blandit, fringilla justo sit amet, mollis enim.
              Donec volutpat sapien at nunc fermentum, vel aliquam turpis
              elementum.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-purple-900 mb-4">
              Find Hidden Treasures
            </h2>
            <p className="text-gray-700">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum nec mi blandit, fringilla justo sit amet, mollis enim.
              Donec volutpat sapien at nunc fermentum, vel aliquam turpis
              elementum.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-purple-900 mb-4">
              Capture Stunning Photos
            </h2>
            <p className="text-gray-700">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum nec mi blandit, fringilla justo sit amet, mollis enim.
              Donec volutpat sapien at nunc fermentum, vel aliquam turpis
              elementum.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-purple-900 mb-4">
              Connect with Nature
            </h2>
            <p className="text-gray-700">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum nec mi blandit, fringilla justo sit amet, mollis enim.
              Donec volutpat sapien at nunc fermentum, vel aliquam turpis
              elementum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
