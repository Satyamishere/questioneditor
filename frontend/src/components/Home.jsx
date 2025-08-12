import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">
          Categorization Quiz
        </h1>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/editor')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg text-lg font-medium transition-colors"
          >
            Create New Quiz
          </button>
          <button
            onClick={() => navigate('/play')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg text-lg font-medium transition-colors"
          >
            Play Latest Quiz
          </button>
        </div>
      </div>
    </div>
  );
}