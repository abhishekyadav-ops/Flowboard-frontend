import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // 1. Flush and explicitly set the token down into storage
      localStorage.setItem("token", token);
      
      // 2. Use replace: true to clear out the oauth parameters from the history stack
      // This stops browser back-button loop errors!
      navigate("/workspaces", { replace: true });
    } else {
      alert("Authentication token not found. Redirecting to login.");
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-1">Verifying Google Session...</h2>
        <p className="text-sm text-slate-400 animate-pulse">Syncing user profile logs with FlowBoard servers</p>
      </div>
    </div>
  );
}