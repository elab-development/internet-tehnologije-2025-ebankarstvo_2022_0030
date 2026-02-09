export function formatDateSR(iso: string | null | undefined): string {
    if (!iso)
        return ""

    const m = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/.exec(iso)
    if (!m)
        return String(iso)

    const [, yyyy, mm, dd] = m
    return `${dd}.${mm}.${yyyy}.`
}
