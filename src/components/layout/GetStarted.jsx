import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function GetStarted({ style }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    return (
        <>
            <button
                className="btn-primary"
                style={{ width: '100%', maxWidth: '280px', marginTop: '12px', ...style }}
                onClick={() => navigate(user ? '/dashboard' : '/signup')}
            >
                {user ? 'Go to Dashboard' : 'Get started'}
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                </svg>
            </button>
        </>
    )
}