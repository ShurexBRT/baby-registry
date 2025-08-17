import { useState } from 'react'

type Props = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  autoComplete?: string
  name?: string
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = 'Lozinka',
  className = '',
  autoComplete = 'current-password',
  name,
}: Props) {
  const [show, setShow] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <input
        name={name}
        type={show ? 'text' : 'password'}
        className="border rounded-xl px-3 py-2 w-full pr-14"
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-sm px-2 py-1 rounded-lg border"
        aria-label={show ? 'Sakrij lozinku' : 'Prikaži lozinku'}
        title={show ? 'Sakrij lozinku' : 'Prikaži lozinku'}
      >
        {show ? 'Sakrij' : 'Prikaži'}
      </button>
    </div>
  )
}
