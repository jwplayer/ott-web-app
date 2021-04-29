const formatDurationTag = (seconds: number): string | null => {
    if (!seconds || typeof seconds !== "number") return null;

    const minutes = Math.ceil(seconds / 60)

    return `${minutes} min`
}

export { formatDurationTag }
