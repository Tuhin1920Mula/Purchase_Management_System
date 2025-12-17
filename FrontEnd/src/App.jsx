import React, { useEffect, useState } from 'react'
import axios from 'axios'
import FollowupDashboard from './components/FollowupDashboard'

const App = () => {
  const [selectedType, setSelectedType] = useState(null) // 'pc' | 'payment' | null
  const [selectedFormNumber, setSelectedFormNumber] = useState(null) // 1 | 2 | 3 | null

  const [showPcFormsMenu, setShowPcFormsMenu] = useState(false)
  const [showPaymentFormsMenu, setShowPaymentFormsMenu] = useState(false)

  const [showLogin, setShowLogin] = useState(false)
  const [loginFor, setLoginFor] = useState(null) // { action, type?, formNumber?, requiredRole }
  const [loginInput, setLoginInput] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [currentUser, setCurrentUser] = useState(null) // {id, username, role, displayName}

  // restore session on refresh
  useEffect(() => {
    const token = localStorage.getItem('pf_token')
    const userStr = localStorage.getItem('pf_user')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr))
      } catch {
        // ignore
      }
    }
  }, [])

  const openLogin = (config) => {
    setLoginFor(config)
    setLoginInput({ username: '', password: '' })
    setLoginError('')
    setShowLogin(true)
  }

  // PC button on first page -> only Anindita can open PC section menu
  const handlePcTopClick = () => {
    openLogin({
      action: 'pcMenu',
      requiredRole: 'anindita',
    })
  }

  // Payment button on first page -> both can see the 3 buttons (no login yet)
  const handlePaymentTopClick = () => {
    setSelectedType('payment')
    setSelectedFormNumber(null)
    setShowPcFormsMenu(false)
    setShowPaymentFormsMenu(true)
  }

  // PC forms 1/2/3 -> again login for Anindita, then open dashboard
  const handlePcFormClick = (formNumber) => {
    openLogin({
      action: 'pcDashboard',
      type: 'pc',
      formNumber,
      requiredRole: 'anindita',
    })
  }

  // Payment forms -> login required for specific person
  const handlePaymentFormClick = (formNumber) => {
    openLogin({
      action: 'paymentDashboard',
      type: 'payment',
      formNumber,
      // BOTH Anindita and Rupak can access all 4 payment forms.
      // Keep login, but remove role restriction.
      requiredRole: null,
    })
  }

  const handleLoginSubmit = () => {
    if (!loginFor) return

    const { username, password } = loginInput

    axios
      .post('/api/auth/login', { username, password })
      .then((res) => {
        const { token, user } = res.data || {}
        if (!token || !user) {
          setLoginError('Login failed')
          return
        }

        // store token for all future api calls
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        localStorage.setItem('pf_token', token)
        localStorage.setItem('pf_user', JSON.stringify(user))
        setCurrentUser(user)

        // If a section has a requiredRole, enforce it.
        if (loginFor.requiredRole && user.role !== loginFor.requiredRole) {
          setLoginError('You are not authorized for this section')
          return
        }

        // Login success
        setShowLogin(false)

        if (loginFor.action === 'pcMenu') {
          setSelectedType('pc')
          setSelectedFormNumber(null)
          setShowPcFormsMenu(true)
          setShowPaymentFormsMenu(false)
          return
        }

        if (loginFor.action === 'pcDashboard') {
          setSelectedType('pc')
          setSelectedFormNumber(loginFor.formNumber)
          setShowPcFormsMenu(false)
          setShowPaymentFormsMenu(false)
          return
        }

        if (loginFor.action === 'paymentDashboard') {
          setSelectedType('payment')
          setSelectedFormNumber(loginFor.formNumber)
          setShowPcFormsMenu(false)
          setShowPaymentFormsMenu(false)
          return
        }
      })
      .catch((e) => {
        console.error(e)
        setLoginError('Invalid username or password')
      })

    return
  }

  const handleDashboardLogout = () => {
    // From PC dashboard -> go back to very first page
    if (selectedType === 'pc') {
      setSelectedType(null)
      setSelectedFormNumber(null)
      setShowPcFormsMenu(false)
      setShowPaymentFormsMenu(false)
      return
    }

    // From Payment dashboard -> go back to 3 payment buttons
    if (selectedType === 'payment') {
      setSelectedType('payment')
      setSelectedFormNumber(null)
      setShowPcFormsMenu(false)
      setShowPaymentFormsMenu(true)
    }
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Purchase Management - Payment and Followup Section</h1>
      </header>

      <main className="app-main">
        {/* Top level selection always visible */}
        <section className="card type-card">
          <h2>Choose Followup Type</h2>
          <div className="button-row">
            <button className="pill-button" onClick={handlePcTopClick}>
              PC Followup
            </button>

            <button className="pill-button" onClick={handlePaymentTopClick}>
              Payment Followup
            </button>
          </div>
        </section>

        {/* PC forms menu (after Anindita logs in for PC section) */}
        {showPcFormsMenu && selectedType === 'pc' && (
          <section className="card form-selector">
            <h3>PC Followup Forms</h3>
            <div className="button-row wrap">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  className="ghost-button"
                  onClick={() => handlePcFormClick(num)}
                >
                  Followup Form {num}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Payment forms menu (after clicking Payment Followup) */}
        {showPaymentFormsMenu && selectedType === 'payment' && (
          <section className="card form-selector">
            <h3>Payment Followup Forms</h3>
            <div className="button-row wrap">
              <button
                className="ghost-button"
                onClick={() => handlePaymentFormClick(1)}
              >
                After Receive Material / FAR
              </button>
              <button
                className="ghost-button"
                onClick={() => handlePaymentFormClick(2)}
              >
                Payment along with PO
              </button>
              <button
                className="ghost-button"
                onClick={() => handlePaymentFormClick(3)}
              >
                Balance before dispatch
              </button>
              <button
                className="ghost-button"
                onClick={() => handlePaymentFormClick(4)}
              >
                Payment after performance warranty / PAPW
              </button>
            </div>
          </section>

        )}

        {/* Dashboard shown after successful login for a specific form */}
        {selectedType && selectedFormNumber && (
          <FollowupDashboard
            type={selectedType}
            formNumber={selectedFormNumber}
            currentUser={currentUser}
            onLogout={handleDashboardLogout}
          />
        )}

        {/* Aesthetic login modal, appears whenever login is required */}
        {showLogin && (
          <div className="login-overlay">
            <div className="login-modal">
              <h3>Secure Login</h3>
              <input
                type="text"
                placeholder="Username"
                value={loginInput.username}
                onChange={(e) =>
                  setLoginInput({ ...loginInput, username: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Password"
                value={loginInput.password}
                onChange={(e) =>
                  setLoginInput({ ...loginInput, password: e.target.value })
                }
              />
              {loginError && (
                <div className="error-banner" style={{ marginTop: '4px' }}>
                  {loginError}
                </div>
              )}
              <div className="button-row" style={{ marginTop: '10px' }}>
                <button
                  className="primary-button"
                  type="button"
                  onClick={handleLoginSubmit}
                >
                  Login
                </button>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => setShowLogin(false)}
                >
                  Cancel
                </button>
              </div>
              <div className="login-hint">
                Demo credentials:
                <br />
                Rupak → <strong>rupak / rupak123</strong>
                <br />
                Anindita → <strong>anindita / anindita123</strong>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
