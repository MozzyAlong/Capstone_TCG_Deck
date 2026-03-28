export type FilterValue = string | string[]

export type FilterOption = {
    value: string
    label: string
}

export type FilterMode = "single" | "multiple"

export type FilterDefinition = {
    id: string
    label: string
    placeholder?: string
    options: FilterOption[]
    mode?: FilterMode
}

export type FilterState = Record<string, FilterValue>