
import React, { useEffect, useState } from 'react'
import axios from 'axios'

const emptyRemarkState = { text: '' }

// This component now only manages REMARKS for the selected row.
// All other fields are edited directly in the grid.
const FollowupForm = ({ current, type, formNumber, onSaved }) => {
  const [form, setForm] = useState(null)
  const [newRemark, setNewRemark] = useState(emptyRemarkState)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setForm(current)
    setMessage('')
    setNewRemark(emptyRemarkState)
  }, [current])

  if (!form) {
    return (
      <div className="hint-card inner">
        <p>Select a row above to view or add remarks for that indent.</p>
      </div>
    )
  }

  const handleAddRemark = () => {
    if (!newRemark.text.trim()) return
    const remarkObj = { text: newRemark.text.trim() }
    const remarks = [...(form.remarks || []), remarkObj]
    setForm((prev) => ({ ...prev, remarks }))
    setNewRemark(emptyRemarkState)
  }

  const handleSaveRemarks = async () => {
    try {
      setSaving(true)
      setMessage('')

      const payload = {
        ...form,
        type,
        formNumber,
      }

      let res
      if (form._id && !form._id.startsWith('demo-') && !form._id.startsWith('temp-')) {
        res = await axios.put(`/api/followups/${form._id}`, payload)
      } else {
        const cloned = { ...payload }
        delete cloned._id
        res = await axios.post('/api/followups', cloned)
      }

      setMessage('Remarks saved.')
      onSaved && onSaved(res.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to save remarks.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="form-card">
      <h3>Remarks</h3>
      <p className="form-tip">
        You can maintain a running history against each indent. Select a row in the grid above,
        type a remark and click <strong>Add Remark</strong>, then <strong>Save Remarks</strong>.
      </p>

      <div className="remarks-section">
        <div className="add-remark">
          <textarea
            rows="2"
            value={newRemark.text}
            onChange={(e) => setNewRemark({ text: e.target.value })}
            placeholder="Type remark and click Add Remark"
          />
          <button type="button" className="primary-button" onClick={handleAddRemark}>
            + Add Remark
          </button>
        </div>

        <ul className="remarks-list">
          {(form.remarks || []).map((r, idx) => (
            <li key={idx}>
              <span>{r.text}</span>
              {r.addedAt && (
                <small>{new Date(r.addedAt).toLocaleString()}</small>
              )}
            </li>
          ))}
          {(!form.remarks || form.remarks.length === 0) && (
            <li className="empty-remarks">No remarks yet. Add the first one.</li>
          )}
        </ul>
      </div>

      <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="primary-button"
          onClick={handleSaveRemarks}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Remarks'}
        </button>
        {message && <span className="save-message">{message}</span>}
      </div>
    </div>
  )
}

export default FollowupForm
