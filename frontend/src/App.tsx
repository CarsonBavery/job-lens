import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider } from "./context/AuthContext";
import GuestRoute from "./components/GuestRoute";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Guest-only routes */}
                    <Route
                        path="/"
                        element={
                            <GuestRoute>
                                <LandingPage />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <LoginPage />
                            </GuestRoute>
                        }
                    />

                    {/* Protected routes placeholder */}
                    <Route
                        path="/dashboard"
                        element={
                            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                                <div className="text-center">
                                    <h1 className="text-4xl font-bold mb-4">Dashboard Placeholder</h1>
                                    <p className="text-slate-400">You are logged in!</p>
                                    <button
                                        onClick={() => window.location.href = '/'}
                                        className="mt-6 bg-primary px-6 py-2 rounded-lg font-bold"
                                    >
                                        Go Back
                                    </button>
                                </div>
                            </div>
                        }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
