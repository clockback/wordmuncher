"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SearchQuestionResult } from "../../search-questions/api";
import styles from "./question-autocomplete.module.css";

interface QuestionAutocompleteProps {
    searchText: string;
    sheetId: number;
    visible: boolean;
    onSelect: (question: SearchQuestionResult) => void;
    onClose: () => void;
}

export default function QuestionAutocomplete({
    searchText,
    sheetId,
    visible,
    onSelect,
    onClose,
}: QuestionAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<SearchQuestionResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const fetchSuggestions = useCallback(
        async (query: string) => {
            if (query.length < 2) {
                setSuggestions([]);
                setSearched(false);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(
                    `/vocab/${sheetId}/search-questions?q=${encodeURIComponent(query)}`,
                );
                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data.questions);
                    setSearched(true);
                }
            } finally {
                setLoading(false);
            }
        },
        [sheetId],
    );

    useEffect(() => {
        if (!visible) {
            setSuggestions([]);
            setSearched(false);
            return;
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            fetchSuggestions(searchText);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [searchText, visible, fetchSuggestions]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (visible) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [visible, onClose]);

    if (!visible) {
        return null;
    }

    if (searchText.length < 2) {
        return null;
    }

    if (loading) {
        return (
            <div ref={containerRef} className={styles.container}>
                <div className={styles.loading}>Searching...</div>
            </div>
        );
    }

    if (searched && suggestions.length === 0) {
        return (
            <div ref={containerRef} className={styles.container}>
                <div className={styles.noResults}>No matching questions</div>
            </div>
        );
    }

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div ref={containerRef} className={styles.container}>
            {suggestions.map((question) => (
                <div
                    key={question.id}
                    className={styles.item}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        onSelect(question);
                    }}
                >
                    <div className={styles.questionText}>
                        {question.questionText}
                    </div>
                    <div className={styles.details}>
                        {question.mainAnswer && (
                            <span className={styles.answer}>
                                {question.mainAnswer}
                            </span>
                        )}
                        {question.sheetNames.length > 0 && (
                            <span className={styles.sheets}>
                                in: {question.sheetNames.join(", ")}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
