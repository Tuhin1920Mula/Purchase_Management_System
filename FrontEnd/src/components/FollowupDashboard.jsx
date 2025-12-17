import React, { useEffect, useState } from 'react'
import axios from 'axios'
import SearchBar from './SearchBar'

const FollowupDashboard = ({ type, formNumber, currentUser, onLogout }) => {
  const [results, setResults] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [expanded, setExpanded] = useState(false)

  // Remarks modal state (per-row)
  const [remarksOpen, setRemarksOpen] = useState(false)
  const [remarksRowId, setRemarksRowId] = useState(null)
  const [remarkDraft, setRemarkDraft] = useState('')
  const [remarksSaving, setRemarksSaving] = useState(false)
  const [remarksMsg, setRemarksMsg] = useState('')

  const label = type === 'pc' ? 'PC Followup' : 'Payment Followup'
  const isPayment = type === 'payment'

  const toIsoDate = (d) => {
    try {
      const dt = new Date(d)
      if (Number.isNaN(dt.getTime())) return ''
      const yyyy = String(dt.getFullYear())
      const mm = String(dt.getMonth() + 1).padStart(2, '0')
      const dd = String(dt.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    } catch {
      return ''
    }
  }

  const msPerDay = 1000 * 60 * 60 * 24

  const addDays = (dateLike, days) => {
    const d = new Date(dateLike)
    if (Number.isNaN(d.getTime())) return null
    d.setDate(d.getDate() + days)
    return d
  }

  // Add/subtract working days while skipping Sundays
  const addWorkingDaysSkippingSundays = (dateLike, days) => {
    const d = new Date(dateLike)
    if (Number.isNaN(d.getTime())) return null
    let remaining = Math.trunc(Number(days) || 0)
    if (remaining === 0) return d

    const step = remaining > 0 ? 1 : -1
    while (remaining !== 0) {
      d.setDate(d.getDate() + step)
      if (d.getDay() === 0) continue // skip Sunday
      remaining -= step
    }
    return d
  }

  const stableUnitRandom = (seedStr) => {
    const s = String(seedStr || '')
    let h = 2166136261
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return ((h >>> 0) % 1000000) / 1000000
  }

  const computePlannedDate = (row) => {
    if (!row) return null
    if (row.plannedDate) return row.plannedDate

    // PAYMENT planned rules (skip Sundays)
    if (isPayment) {
      const lead = Number(row.leadDays)
      const po = row.poDate || row.timestamp

      if (Number(formNumber) === 1) {
        const materialReceivedActual =
          row.materialReceivedActualDate ||
          row.materialReceivedActual ||
          row.grnActualDate ||
          row.grnActual
        if (!materialReceivedActual) return null
        return addWorkingDaysSkippingSundays(materialReceivedActual, 12)?.toISOString()
      }

      if (Number(formNumber) === 2) {
        if (!po) return null
        return addWorkingDaysSkippingSundays(po, 2)?.toISOString()
      }

      if (Number(formNumber) === 3) {
        if (!po || !Number.isFinite(lead)) return null
        const afterLead = addWorkingDaysSkippingSundays(po, lead)
        if (!afterLead) return null
        return addWorkingDaysSkippingSundays(afterLead, -7)?.toISOString()
      }

      if (Number(formNumber) === 4) {
        if (!po || !Number.isFinite(lead)) return null
        const afterLead = addWorkingDaysSkippingSundays(po, lead)
        if (!afterLead) return null
        return addWorkingDaysSkippingSundays(afterLead, 15)?.toISOString()
      }

      return null
    }

    // PC planned rules
    const lead = Number(row.leadDays)
    const po = row.poDate || row.timestamp
    if (!po || !Number.isFinite(lead)) return null

    if (Number(formNumber) === 1) {
      if (lead <= 7) return addDays(po, 1)?.toISOString()
      if (lead <= 15) return addDays(po, 6)?.toISOString()
      if (lead <= 21) return addDays(po, 12)?.toISOString()
      if (lead <= 30) return addDays(po, 15)?.toISOString()
      if (lead <= 45) return addDays(po, 15)?.toISOString()
      if (lead <= 60) return addDays(po, 20)?.toISOString()
      if (lead <= 90) return addDays(po, 25)?.toISOString()
      return null
    }

    if (Number(formNumber) === 2) {
      if (lead <= 7) return null
      const base = addDays(po, lead - 1)
      if (!base) return null
      const r = stableUnitRandom(row._id || row.uniqueId || row.indentNumber || '')
      const startSec = 10 * 3600
      const endSec = 18 * 3600
      const sec = Math.floor(startSec + r * (endSec - startSec))
      base.setHours(0, 0, 0, 0)
      base.setSeconds(sec)
      return base.toISOString()
    }

    if (Number(formNumber) === 3) {
      if (lead >= 31 && lead <= 45) return addDays(po, 42)?.toISOString()
      if (lead >= 31 && lead <= 60) return addDays(po, 56)?.toISOString()
      if (lead >= 31 && lead <= 90) return addDays(po, 80)?.toISOString()
      return null
    }

    return null
  }

  const computeTimeDelayDays = (plannedDateLike, actualDateLike) => {
    if (!plannedDateLike) return ''
    const planned = new Date(plannedDateLike)
    if (Number.isNaN(planned.getTime())) return ''
    const today = new Date()

    if (actualDateLike) {
      const actual = new Date(actualDateLike)
      if (Number.isNaN(actual.getTime())) return ''
      if (actual.getTime() > planned.getTime()) {
        return Math.round((actual.getTime() - planned.getTime()) / msPerDay)
      }
      return ''
    }

    return Math.round((today.getTime() - planned.getTime()) / msPerDay)
  }

  // ✅ Payment: copy per-user DB fields into editable UI fields (transactionNo/actualDate/status)
  const hydrateEditableFields = (row) => {
    if (!row || !isPayment) return row
    const role = (currentUser?.role || '').toLowerCase()
    const ui = { ...row }

    if (role === 'rupak') {
      ui.transactionNo = row.transactionNoRupak || ''
      ui.actualDate = row.actualDateRupak || ''
      ui.status = row.statusRupak || 'PENDING'
    } else if (role === 'anindita') {
      ui.transactionNo = row.transactionNoAnindita || ''
      ui.actualDate = row.actualDateAnindita || ''
      ui.status = row.statusAnindita || 'PENDING'
    } else {
      ui.transactionNo = ''
      ui.actualDate = ''
      ui.status = 'PENDING'
    }

    // Local-only pending remarks bucket
    if (!Array.isArray(ui.__pendingRemarks)) ui.__pendingRemarks = []

    return ui
  }

  const applyFiltersLocally = (rows, filters) => {
    let out = [...rows]
    const mode = filters.searchBy || ''

    if ((mode === 'indent' || !mode) && filters.indentNumber) {
      const q = filters.indentNumber.toLowerCase()
      out = out.filter((r) => (r.indentNumber || '').toLowerCase().includes(q))
    }

    if (mode === 'date' && filters.date) {
      const qDate = filters.date
      out = out.filter((r) => {
        const dateSource = r.timestamp || r.plannedDate
        const rowDate = toIsoDate(dateSource)
        return rowDate && rowDate === qDate
      })
    }

    if ((mode === 'range' || !mode) && filters.fromDate) {
      const from = new Date(filters.fromDate)
      out = out.filter((r) => {
        const dateSource = r.timestamp || r.plannedDate
        return dateSource && new Date(dateSource) >= from
      })
    }

    if ((mode === 'range' || !mode) && filters.toDate) {
      const to = new Date(filters.toDate)
      to.setHours(23, 59, 59, 999)
      out = out.filter((r) => {
        const dateSource = r.timestamp || r.plannedDate
        return dateSource && new Date(dateSource) <= to
      })
    }

    if (filters.site) {
      const siteQ = filters.site.toLowerCase()
      out = out.filter((r) => (r.site || '').toLowerCase().includes(siteQ))
    }

    return out
  }

  const performSearch = async (filters = {}) => {
    if (!type || !formNumber) return

    try {
      setLoading(true)
      setError('')
      setInfo('')

      const params = {
        type,
        formNumber,
        ...(filters.searchBy ? { searchBy: filters.searchBy } : {}),
        ...(filters.indentNumber ? { indentNumber: filters.indentNumber } : {}),
        ...(filters.date ? { date: filters.date } : {}),
        ...(filters.fromDate ? { fromDate: filters.fromDate } : {}),
        ...(filters.toDate ? { toDate: filters.toDate } : {}),
        ...(filters.site ? { site: filters.site } : {}),
      }

      const res = await axios.get('/api/followups', { params })
      const docs = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : []

      const filteredDocs = applyFiltersLocally(docs, filters).map(hydrateEditableFields)

      setResults(filteredDocs)
      setSelectedId(filteredDocs[0]?._id || null)

      if (filteredDocs.length === 0) {
        setInfo('No records found in database for this form. (Use your backend seed or insert purchase records into MongoDB.)')
      }
    } catch (err) {
      console.error(err)
      setResults([])
      setSelectedId(null)
      if (err?.response?.status === 401) {
        setError('Unauthorized. Please login again.')
      } else {
        setError('Backend could not be reached or returned an error. Please start backend and MongoDB.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    performSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, formNumber])

  useEffect(() => {
    setResults((prev) => prev.map(hydrateEditableFields))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.role])

  const handleCellChange = (id, field, value) => {
    setResults((prev) =>
      prev.map((row) => (row._id === id ? { ...row, [field]: value, __dirty: true } : row))
    )
  }

  const handleSaveRow = async (row) => {
    try {
      setLoading(true)
      setError('')
      setInfo('')

      const computedPlanned = computePlannedDate(row)
      const plannedDate = row.plannedDate || computedPlanned || null

      // ✅ Only send fields backend actually uses for updates
      const payload = isPayment
        ? {
            plannedDate,
            transactionNo: row.transactionNo || '',
            actualDate: row.actualDate || null,
            status: row.status || 'PENDING',
            timeDelay: (() => {
              const delay = computeTimeDelayDays(plannedDate, row.actualDate)
              return delay === '' ? null : Number(delay)
            })(),
          }
        : {
            plannedDate,
            actualDate: row.actualDate || null,
            status: row.status || 'PENDING',
            timeDelay: (() => {
              const delay = computeTimeDelayDays(plannedDate, row.actualDate)
              return delay === '' ? null : Number(delay)
            })(),
          }

      const res = await axios.put(`/api/followups/${row._id}`, payload)

      const saved = hydrateEditableFields(res.data)

      setResults((prev) => prev.map((r) => (r._id === row._id ? saved : r)))
      setSelectedId(saved._id)
      setInfo('Row saved successfully.')
    } catch (err) {
      console.error(err)
      setError('Failed to save this row.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    const newRow = {
      _id: 'temp-' + Date.now(),
      type,
      formNumber,
      site: '',
      timestamp: new Date().toISOString(),
      uniqueId: '',
      indentNumber: '',
      itemNumber: '',
      item: '',
      description: '',
      uom: '',
      totalQty: '',
      submittedBy: '',
      vendorName: '',
      leadDays: '',
      paymentCondition: '',
      poNumber: '',
      poDate: '',
      plannedDate: '',
      remarks: [],
      __pendingRemarks: [],
    }

    if (isPayment) {
      newRow.transactionNo = ''
      newRow.actualDate = ''
      newRow.status = 'PENDING'
    } else {
      newRow.actualDate = ''
      newRow.status = 'PENDING'
    }

    setResults((prev) => [newRow, ...prev])
    setSelectedId(newRow._id)
  }

  const openRemarksForRow = (row) => {
    if (!row?._id) return
    setSelectedId(row._id)
    setRemarksRowId(row._id)
    setRemarkDraft('')
    setRemarksMsg('')
    setRemarksOpen(true)
  }

  const closeRemarks = () => {
    setRemarksOpen(false)
    setRemarksRowId(null)
    setRemarkDraft('')
    setRemarksMsg('')
    setRemarksSaving(false)
  }

  // ✅ Add remark locally (pending) — does NOT touch DB yet
  const addRemarkToRowLocal = () => {
    const txt = (remarkDraft || '').trim()
    if (!txt || !remarksRowId) return

    setResults((prev) =>
      prev.map((r) =>
        r._id === remarksRowId
          ? {
              ...r,
              __pendingRemarks: [...(r.__pendingRemarks || []), txt],
              __dirty: true,
            }
          : r
      )
    )

    setRemarkDraft('')
    setRemarksMsg('Remark added (pending). Click "Save Remarks" to store in DB.')
  }

  // ✅ Save all pending remarks to DB using backend { addRemark: "..." }
  const saveRemarksForRow = async () => {
    if (!remarksRowId) return
    const row = results.find((r) => r._id === remarksRowId)
    if (!row) return

    const pending = Array.isArray(row.__pendingRemarks) ? row.__pendingRemarks.filter(Boolean) : []
    if (pending.length === 0) {
      setRemarksMsg('No pending remarks to save. Add a remark first.')
      return
    }

    try {
      setRemarksSaving(true)
      setRemarksMsg('Saving remarks...')

      let lastSaved = null
      for (const txt of pending) {
        const res = await axios.put(`/api/followups/${row._id}`, { addRemark: txt })
        lastSaved = res.data
      }

      const saved = hydrateEditableFields(lastSaved)

      // Clear pending remarks after successful save
      setResults((prev) =>
        prev.map((r) =>
          r._id === row._id ? { ...saved, __pendingRemarks: [] } : r
        )
      )

      setSelectedId(saved._id)
      setRemarksMsg('Remarks saved successfully.')
    } catch (err) {
      console.error(err)
      setRemarksMsg('Failed to save remarks.')
    } finally {
      setRemarksSaving(false)
    }
  }

  const selected = results.find((r) => r._id === selectedId) || null
  const selectedPendingCount =
    selected && Array.isArray(selected.__pendingRemarks) ? selected.__pendingRemarks.length : 0

  const renderDateValue = (val) => {
    if (!val) return ''
    try {
      const d = new Date(val)
      const iso = d.toISOString()
      return iso.substring(0, 10)
    } catch {
      return ''
    }
  }

  const renderTimestamp = (val) => {
    if (!val) return ''
    try {
      const d = new Date(val)
      return d.toLocaleString()
    } catch {
      return ''
    }
  }

  const renderTimeDelay = (row) => {
    const planned = computePlannedDate(row)
    const actual = row.actualDate
    if (row.timeDelay !== undefined && row.timeDelay !== null && row.timeDelay !== '') {
      return row.timeDelay
    }
    return computeTimeDelayDays(planned, actual)
  }

  const getOtherUserSummary = (row) => {
    if (!isPayment) return ''
    const role = (currentUser?.role || '').toLowerCase()
    const other = role === 'rupak' ? 'anindita' : 'rupak'
    if (other === 'rupak') {
      const t = row.transactionNoRupak || ''
      const a = row.actualDateRupak ? renderDateValue(row.actualDateRupak) : ''
      const s = row.statusRupak || ''
      return `Other (Rupak): ${t || '-'} | ${a || '-'} | ${s || '-'}`
    }
    const t = row.transactionNoAnindita || ''
    const a = row.actualDateAnindita ? renderDateValue(row.actualDateAnindita) : ''
    const s = row.statusAnindita || ''
    return `Other (Anindita): ${t || '-'} | ${a || '-'} | ${s || '-'}`
  }

  return (
    <section className="card dashboard-card">
      <header className="dashboard-header">
        <div>
          <h2>
            {label} - Form {formNumber}
          </h2>
          
        </div>
        <div className="dashboard-actions">
          
          <button type="button" className="ghost-button" onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? 'Normal View' : 'Maximize Table'}
          </button>
          {onLogout && (
            <button type="button" className="ghost-button" onClick={onLogout} disabled={loading}>
              Logout
            </button>
          )}
        </div>
      </header>

      <SearchBar onSearch={performSearch} loading={loading} />

      {error && <div className="error-banner">{error}</div>}
      {info && <div className="hint-card">{info}</div>}

      <div className={`table-wrapper ${expanded ? 'table-wrapper-expanded' : ''}`}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Site</th>
              <th>Unique Id</th>
              <th>I.N</th>
              <th>Item No</th>
              <th>Item</th>
              <th>Description</th>
              <th>UOM</th>
              <th>Total Qty</th>
              <th>PO Number</th>
              <th>Submitted By</th>
              <th>Vendor Name</th>
              <th>Lead Days</th>
              <th>Payment Condition</th>
              <th>PO Date</th>
              {isPayment && <th>Transaction No</th>}
              <th>Planned</th>
              <th>Actual</th>
              <th>Status</th>
              <th>Time Delay (Days)</th>
              <th>Remarks</th>
              <th>Save</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 && (
              <tr>
                <td colSpan={isPayment ? 22 : 21} className="empty-row">
                  No records found. Try adjusting your filters or add a new followup.
                </td>
              </tr>
            )}

            {results.map((row) => {
              const isSelected = row._id === selectedId
              return (
                <tr key={row._id} className={isSelected ? 'selected-row' : ''} onClick={() => setSelectedId(row._id)}>
                  <td>{renderTimestamp(row.timestamp || row.plannedDate)}</td>
                  <td>{row.site || ''}</td>
                  <td>{row.uniqueId || ''}</td>
                  <td>{row.indentNumber || ''}</td>
                  <td>{row.itemNumber || ''}</td>
                  <td>{row.item || ''}</td>
                  <td>{row.description || ''}</td>
                  <td>{row.uom || ''}</td>
                  <td>{row.totalQty || ''}</td>
                  <td>{row.poNumber || ''}</td>
                  <td>{row.submittedBy || ''}</td>
                  <td>{row.vendorName || ''}</td>
                  <td>{row.leadDays || ''}</td>
                  <td>{row.paymentCondition || ''}</td>
                  <td>{renderDateValue(row.poDate)}</td>

                  {isPayment && (
                    <td>
                      <input
                        type="text"
                        value={row.transactionNo || ''}
                        onChange={(e) => handleCellChange(row._id, 'transactionNo', e.target.value)}
                      />
                      <div className="hint" style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                        {getOtherUserSummary(row)}
                      </div>
                    </td>
                  )}

                  <td>{renderDateValue(computePlannedDate(row))}</td>

                  <td>
                    <input
                      type="date"
                      value={renderDateValue(row.actualDate)}
                      onChange={(e) => handleCellChange(row._id, 'actualDate', e.target.value)}
                    />
                    {isPayment && (
                      <div className="hint" style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                        Saving as: {currentUser?.role || 'user'}
                      </div>
                    )}
                  </td>

                  <td>
                    <select value={row.status || 'PENDING'} onChange={(e) => handleCellChange(row._id, 'status', e.target.value)}>
                      <option value="DONE">DONE</option>
                      <option value="HOLD">HOLD</option>
                      <option value="CANCELED">CANCELED</option>
                      <option value="PENDING">PENDING</option>
                    </select>
                  </td>

                  <td>{renderTimeDelay(row)}</td>

                  <td>
                    <button
                      type="button"
                      className="ghost-button small"
                      onClick={(e) => {
                        e.stopPropagation()
                        openRemarksForRow(row)
                      }}
                    >
                      Remarks ({(row.remarks || []).length})
                      {row.__pendingRemarks?.length ? ` +${row.__pendingRemarks.length}` : ''}
                    </button>
                  </td>

                  <td>
                    <button type="button" className="primary-button" onClick={() => handleSaveRow(row)} disabled={loading}>
                      Save
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Remarks modal */}
      {remarksOpen && (
        <div
          className="remarks-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeRemarks()
          }}
        >
          <div className="remarks-modal">
            <div className="remarks-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Remarks</h3>
                <p className="remarks-subtitle">
                  {selected?.site ? `${selected.site} • ` : ''}
                  {selected?.indentNumber ? `I.N: ${selected.indentNumber}` : ''}
                </p>
              </div>
              <button type="button" className="ghost-button" onClick={closeRemarks}>
                Close
              </button>
            </div>

            <div className="remarks-body">
              <div className="remarks-add">
                <textarea
                  rows="2"
                  value={remarkDraft}
                  onChange={(e) => setRemarkDraft(e.target.value)}
                  placeholder="Type a remark and click Add Remark"
                />
                <div className="remarks-add-actions">
                  <button type="button" className="primary-button" onClick={addRemarkToRowLocal} disabled={remarksSaving}>
                    + Add Remark
                  </button>
                  <button type="button" className="ghost-button" onClick={saveRemarksForRow} disabled={remarksSaving}>
                    {remarksSaving ? 'Saving…' : `Save Remarks${selectedPendingCount ? ` (${selectedPendingCount})` : ''}`}
                  </button>
                </div>
                {remarksMsg && <div className="remarks-message">{remarksMsg}</div>}
              </div>

              <ul className="remarks-list">
                {(selected?.remarks || []).map((r, idx) => (
                  <li key={idx}>
                    <span>{r.text}</span>
                    {r.addedAt && <small>{new Date(r.addedAt).toLocaleString()}</small>}
                  </li>
                ))}
                {(!selected?.remarks || selected.remarks.length === 0) && (
                  <li className="empty-remarks">No saved remarks yet.</li>
                )}
              </ul>

              {selectedPendingCount > 0 && (
                <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
                  Pending remarks: {selectedPendingCount} (not yet stored in DB)
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default FollowupDashboard
