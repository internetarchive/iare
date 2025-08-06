import { useEffect, useState } from 'react';

export function useResizeObserver(ref) {
    const [dimensions, setDimensions] = useState(null);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                setDimensions(entry.contentRect);
            }
        });

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref]);

    return dimensions;
}
