import React, { useState } from 'react'

const SITE_OPTIONS = [
  { value: '', label: 'All Sites' },
  { value: 'HIPL', label: 'HIPL' },
  { value: 'RSIPL', label: 'RSIPL' },
  { value: 'SUNAGROW', label: 'SUNAGROW' },
  { value: 'RICE FIELD', label: 'RICE FIELD' },
  { value: 'HRM', label: 'HRM' },
]

const SearchBar = ({ onSearch, loading }) => {
  // Choose one: Indent No, single Date, or Date Range.
  // Site filter is always available.
  const [searchBy, setSearchBy] = useState('indent') // 'indent' | 'date' | 'range'
  const [indentNumber, setIndentNumber] = useState('')
  const [singleDate, setSingleDate] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [site, setSite] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      searchBy,
      site,
      indentNumber: searchBy === 'indent' ? indentNumber : '',
      date: searchBy === 'date' ? singleDate : '',
      fromDate: searchBy === 'range' ? fromDate : '',
      toDate: searchBy === 'range' ? toDate : '',
    }
    onSearch(payload)
  }

  const handleReset = () => {
    setSearchBy('indent')
    setIndentNumber('')
    setSingleDate('')
    setFromDate('')
    setToDate('')
    setSite('')
    onSearch({ searchBy: 'indent', indentNumber: '', date: '', fromDate: '', toDate: '', site: '' })
  }

  const handleSearchByChange = (val) => {
    setSearchBy(val)
    // Clear non-relevant fields so user doesn't accidentally mix filters.
    if (val !== 'indent') setIndentNumber('')
    if (val !== 'date') setSingleDate('')
    if (val !== 'range') {
      setFromDate('')
      setToDate('')
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="field">
        <label>Search By</label>
        <select value={searchBy} onChange={(e) => handleSearchByChange(e.target.value)}>
          <option value="indent">Indent No.</option>
          <option value="date">Date</option>
          <option value="range">Date Range</option>
        </select>
      </div>

      {searchBy === 'indent' && (
      <div className="field">
        <label>Indent No.</label>
        <input
          type="text"
          value={indentNumber}
          onChange={(e) => setIndentNumber(e.target.value)}
          placeholder="Search by Indent Number"
        />
      </div>
      )}

      {searchBy === 'date' && (
        <div className="field">
          <label>Date (Planned/Timestamp)</label>
          <input
            type="date"
            value={singleDate}
            onChange={(e) => setSingleDate(e.target.value)}
          />
        </div>
      )}

      {searchBy === 'range' && (
        <>
          <div className="field">
            <label>From Date (Planned/Timestamp)</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label>To Date (Planned/Timestamp)</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </>
      )}

      <div className="field">
        <label>Site</label>
        <select value={site} onChange={(e) => setSite(e.target.value)}>
          {SITE_OPTIONS.map((opt) => (
            <option key={opt.value || 'ALL'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="search-actions">
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
        <button type="button" className="ghost-button" onClick={handleReset}>
          Clear
        </button>
      </div>
    </form>
  )
}

export default SearchBar
