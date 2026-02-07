type Props = {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    error?: string
    type?: string
}

export default function Input({label, value, onChange, placeholder, error, type = "text"}: Props) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{label}</label>
            <input 
                type={type} 
                value={value} 
                placeholder={placeholder} 
                onChange={(e) => onChange(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2 outline-none focus:border-indigo-600"/>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
    )
}