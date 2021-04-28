const formatVideoDurationTag = (seconds: number): string | void => {
    if (!seconds || typeof seconds !== "number") return;

    const minutes = Math.ceil(seconds / 60)

    return `${minutes} min`


}

export { formatVideoDurationTag }
