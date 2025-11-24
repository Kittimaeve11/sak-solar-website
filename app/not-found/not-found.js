import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
            <div className="text-center max-w-xl">
                <h1 className="text-5xl font-extrabold text-gray-800 mb-3">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    Looks like you&apos;ve found the doorway to the great nothing
                </h2>
                <p className="text-gray-600 mb-6">
                    The content you’re looking for doesn’t exist. Either it was removed,
                    or the link you followed is incorrect.
                </p>

                <Link href="/">
                    <button
                        className="px-8 py-3 bg-orange-500 hover:bg-orange-600 transition text-white rounded-md font-medium"
                    >
                        ⬅ Go back to Homepage
                    </button>
                </Link>
            </div>
        </div>
    );
}
