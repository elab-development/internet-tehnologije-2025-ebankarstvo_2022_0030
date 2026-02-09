type Props = {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    error?: string
    type?: string
    disabled?: boolean
}

export default function Input({ label, value, onChange, placeholder, error, type = "text", disabled = false }: Props) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">{label}</label>
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"/>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
    )
}