type Props = {
    children: React.ReactNode
    onClick?: () => void
    type?: "button" | "submit"
    disabled?: boolean
}

export default function Button({children, onClick, type = "button", disabled} : Props) {
    return (
        <button 
            onClick = {onClick}
            type = {type}
            disabled = {disabled}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                {children}
        </button>
    )
}