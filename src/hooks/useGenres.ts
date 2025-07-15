import { useState, useEffect } from 'react';

interface Genre {
    id: number;
    name: string;
}

export const useGenres = () => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/genres');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch genres');
                }
                
                const data = await response.json();
                setGenres(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching genres:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch genres');
                // Fallback to empty array or mock data
                setGenres([]);
            } finally {
                setLoading(false);
            }
        };

        fetchGenres();
    }, []);

    return { genres, loading, error };
};