import React, { useState } from 'react'
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { Genre } from '@/lib/tmdb'
import { useThemeMode } from '@/contexts/ThemeModeContext'

export interface FilterOptions {
    year: number | null
    genreIds: number[]
    minRating: number
    maxRating: number
    minRuntime: number | null
    maxRuntime: number | null
    sortBy: string
    language: string
    includeAdult: boolean
}

interface FilterModalProps {
    visible: boolean
    onClose: () => void
    onApply: (filters: FilterOptions) => void
    onReset: () => void
    currentFilters: FilterOptions
    genres: Genre[]
    contentType: 'movies' | 'anime'
}

const sortOptions = [
    { label: 'Most Popular', value: 'popularity.desc' },
    { label: 'Highest Rated', value: 'vote_average.desc' },
    { label: 'Newest First', value: 'primary_release_date.desc' },
    { label: 'Oldest First', value: 'primary_release_date.asc' },
    { label: 'Revenue', value: 'revenue.desc' },
]

const yearOptions = [null, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2015, 2010, 2005, 2000]

const ratingOptions = [0, 5, 6, 7, 8, 9]

export const FilterModal = ({
    visible,
    onClose,
    onApply,
    onReset,
    currentFilters,
    genres,
}: FilterModalProps) => {
    const { colors: themeColors } = useThemeMode()
    const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters)

    React.useEffect(() => {
        if (visible) {
            setLocalFilters(currentFilters)
        }
    }, [visible, currentFilters])

    const toggleGenre = (genreId: number) => {
        setLocalFilters(prev => ({
            ...prev,
            genreIds: prev.genreIds.includes(genreId)
                ? prev.genreIds.filter(id => id !== genreId)
                : [...prev.genreIds, genreId]
        }))
    }

    const handleApply = () => {
        onApply(localFilters)
        onClose()
    }

    const handleReset = () => {
        const defaultFilters: FilterOptions = {
            year: null,
            genreIds: [],
            minRating: 0,
            maxRating: 10,
            minRuntime: null,
            maxRuntime: null,
            sortBy: 'popularity.desc',
            language: '',
            includeAdult: false,
        }
        setLocalFilters(defaultFilters)
        onReset()
        onClose()
    }

    const activeCount = [
        localFilters.year !== null,
        localFilters.genreIds.length > 0,
        localFilters.minRating > 0,
        localFilters.sortBy !== 'popularity.desc',
        localFilters.language !== '',
    ].filter(Boolean).length

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={styles.sheet}>
                    {/* Handle */}
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Filters</Text>
                        {activeCount > 0 && (
                            <TouchableOpacity onPress={handleReset}>
                                <Text style={styles.resetText}>Reset All</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 32 }}
                    >
                        {/* Sort By */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Sort By</Text>
                            <View style={styles.chipRow}>
                                {sortOptions.map(opt => (
                                    <TouchableOpacity
                                        key={opt.value}
                                        style={[
                                            styles.chip,
                                            localFilters.sortBy === opt.value && { backgroundColor: themeColors.primaryRgba, borderColor: `${themeColors.primary}66` },
                                        ]}
                                        onPress={() => setLocalFilters(prev => ({ ...prev, sortBy: opt.value }))}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            localFilters.sortBy === opt.value && { color: themeColors.primary },
                                        ]}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Genres */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Genres</Text>
                            <View style={styles.chipRow}>
                                {genres.map(genre => (
                                    <TouchableOpacity
                                        key={genre.id}
                                        style={[
                                            styles.chip,
                                            localFilters.genreIds.includes(genre.id) && { backgroundColor: themeColors.primaryRgba, borderColor: `${themeColors.primary}66` },
                                        ]}
                                        onPress={() => toggleGenre(genre.id)}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            localFilters.genreIds.includes(genre.id) && { color: themeColors.primary },
                                        ]}>
                                            {genre.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Year */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Release Year</Text>
                            <View style={styles.chipRow}>
                                {yearOptions.map(year => (
                                    <TouchableOpacity
                                        key={year ?? 'any'}
                                        style={[
                                            styles.chip,
                                            localFilters.year === year && { backgroundColor: themeColors.primaryRgba, borderColor: `${themeColors.primary}66` },
                                        ]}
                                        onPress={() => setLocalFilters(prev => ({ ...prev, year }))}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            localFilters.year === year && { color: themeColors.primary },
                                        ]}>
                                            {year ?? 'Any'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Minimum Rating */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Minimum Rating</Text>
                            <View style={styles.chipRow}>
                                {ratingOptions.map(rating => (
                                    <TouchableOpacity
                                        key={rating}
                                        style={[
                                            styles.chip,
                                            localFilters.minRating === rating && { backgroundColor: themeColors.primaryRgba, borderColor: `${themeColors.primary}66` },
                                        ]}
                                        onPress={() => setLocalFilters(prev => ({ ...prev, minRating: rating }))}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            localFilters.minRating === rating && { color: themeColors.primary },
                                        ]}>
                                            {rating === 0 ? 'Any' : `${rating}+ ★`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Apply Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={[styles.applyButton, { backgroundColor: themeColors.primary }]} onPress={handleApply}>
                            <Text style={styles.applyText}>
                                Apply Filters{activeCount > 0 ? ` (${activeCount})` : ''}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheet: {
        backgroundColor: '#0f1218',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderBottomWidth: 0,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    },
    title: {
        color: '#f1f5f9',
        fontSize: 18,
        fontWeight: '700',
    },
    resetText: {
        color: '#ef4444',
        fontSize: 13,
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionTitle: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: '#061218',
    },
    chipActive: {
        backgroundColor: '#0a2a33',
        borderColor: 'rgba(47, 155, 188, 0.4)',
    },
    chipText: {
        color: '#64748b',
        fontSize: 13,
        fontWeight: '500',
    },
    chipTextActive: {
        color: '#2F9BBC',
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.06)',
    },
    applyButton: {
        backgroundColor: '#2F9BBC',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    applyText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
})
