import { useState, useRef, useEffect } from 'react'
import { condoProjects, type CondoProject } from '../data/condoProjects'

interface AutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  name?: string
}

const AutocompleteInput = ({ value, onChange, placeholder, className, name }: AutocompleteInputProps) => {
  const [suggestions, setSuggestions] = useState<CondoProject[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionRefs = useRef<(HTMLLIElement | null)[]>([])

  const filterSuggestions = (query: string): CondoProject[] => {
    if (!query.trim()) return []
    
    const lowerQuery = query.toLowerCase()
    return condoProjects.filter(project => 
      project.english.toLowerCase().includes(lowerQuery) ||
      project.thai.includes(query)
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    onChange(inputValue)
    
    const filtered = filterSuggestions(inputValue)
    setSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
    setActiveSuggestion(-1)
  }

  const handleSuggestionClick = (project: CondoProject) => {
    // Use English name as the primary value
    onChange(project.english)
    setShowSuggestions(false)
    setActiveSuggestion(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (activeSuggestion >= 0) {
          handleSuggestionClick(suggestions[activeSuggestion])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setActiveSuggestion(-1)
        break
    }
  }

  const handleFocus = () => {
    if (value && suggestions.length === 0) {
      const filtered = filterSuggestions(value)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    }
  }

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      setShowSuggestions(false)
      setActiveSuggestion(-1)
    }, 200)
  }

  // Scroll active suggestion into view
  useEffect(() => {
    if (activeSuggestion >= 0 && suggestionRefs.current[activeSuggestion]) {
      suggestionRefs.current[activeSuggestion]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    }
  }, [activeSuggestion])

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        name={name}
        autoComplete="off"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((project, index) => (
            <li
              key={project.id}
              ref={(el) => (suggestionRefs.current[index] = el)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === activeSuggestion 
                  ? 'bg-blue-50 text-blue-900' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSuggestionClick(project)}
            >
              <div className="font-medium text-gray-900">{project.english}</div>
              <div className="text-sm text-gray-500 mt-1">{project.thai}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AutocompleteInput