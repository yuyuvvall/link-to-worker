import React, { useState } from 'react';

interface SearchBarProps {
    onSubmit: (query: string) => void
}

const SearchBar: React.FC<SearchBarProps> = ({ onSubmit }) => {
    const [query, setQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            onSubmit(query);
            console.log('Results fetched:');

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="search-container">
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                    disabled={isLoading}
                    style={{ padding: '8px', fontSize: '16px' }}
                />
                <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    style={{ padding: '8px 16px', fontSize: '16px' }}
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {/* Conditional rendering for errors and results */}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default SearchBar;