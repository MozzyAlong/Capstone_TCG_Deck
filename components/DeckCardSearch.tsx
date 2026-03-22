import { useState } from "react"
import type { FilterDefinition, FilterState, FilterValue } from "@/lib/tcg/filters/types"

type DeckCardSearchProps = {
    searchValue: string
    onSearchValueChange: (value: string) => void
    onSubmit: (event: React.FormEvent) => void
    isLoading: boolean
    filters?: FilterDefinition[]
    filterValues?: FilterState
    onFilterChange?: (filterId: string, value: FilterValue) => void
    filtersLoading?: boolean
    filtersError?: string | null
}

export default function DeckCardSearch({
                                           searchValue,
                                           onSearchValueChange,
                                           onSubmit,
                                           isLoading,
                                           filters = [],
                                           filterValues = {},
                                           onFilterChange,
                                           filtersLoading = false,
                                           filtersError = null,
                                       }: DeckCardSearchProps) {

    const [showFilters, setShowFilters] = useState(true)

    return (
        <div className="mb-5 w-full">
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="min-w-0 flex-1">
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(event) => onSearchValueChange(event.target.value)}
                            placeholder="Search cards"
                            className="h-12 w-full rounded-lg border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-blue-400/60"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowFilters((prev) => !prev)}
                            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
                        >
                            {showFilters ? "Hide filters" : "Show filters"}
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-blue-500/25 px-6 text-sm font-semibold text-white transition hover:bg-blue-500/35 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading ? "Searching" : "Search"}
                        </button>
                    </div>
                </div>

                {showFilters && filters.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filters.map((filter) => (
                            <div key={filter.id} className="min-w-0">
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    {filter.label}
                                </label>

                                {/* make sure id is string */}
                                <select
                                    value={
                                        typeof filterValues[filter.id] === "string"
                                            ? (filterValues[filter.id] as string)
                                            : ""
                                    }
                                    onChange={(event) =>
                                        onFilterChange?.(filter.id, event.target.value)
                                    }
                                    className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition focus:border-blue-400/60"
                                >
                                    <option value="">
                                        {filter.placeholder}
                                    </option>

                                    {filter.options.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                            className="bg-gray-900 text-white"
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                )}

                {showFilters && filtersLoading && (
                    <p className="text-sm text-gray-400">Loading filters...</p>
                )}

                {showFilters && filtersError && (
                    <p className="text-sm text-red-400">{filtersError}</p>
                )}
            </form>
        </div>
    )
}