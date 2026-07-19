import { Link } from 'react-router-dom';

export default function Logo() {
    return (
        <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
            flexShrink: 0
        }}>
            <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block' }}
            >
                <path
                    d="M16 2L6 7L16 12L26 7L16 2Z"
                    fill="var(--accent-color)"
                    stroke="var(--accent-color)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                <path
                    d="M6 13L16 18L26 13"
                    stroke="var(--accent-color)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.8"
                />
                <path
                    d="M6 19L16 24L26 19"
                    stroke="var(--accent-color)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.5"
                />
            </svg>
            <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '20px',
                color: 'var(--text-color)',
                letterSpacing: '-0.02em',
                lineHeight: 1
            }}>
                DevOneStack
            </span>
        </Link>
    )
}