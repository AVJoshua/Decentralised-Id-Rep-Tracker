import { useState, useEffect, useCallback, useMemo } from 'react'

export interface DisputeRecord {
  subject: string
  attester: string
  raiser: string
  timestamp: number
  /** 'accepted' | 'dismissed' | undefined (still pending) */
  outcome?: 'accepted' | 'dismissed'
}

export interface DisputeCounts {
  accepted: number
  dismissed: number
  pending: number
  total: number
}

const STORAGE_KEY = 'dirt_disputes'

function loadDisputes(): DisputeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveDisputes(records: DisputeRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

/**
 * Global dispute registry stored in localStorage.
 * All raised disputes are tracked so any wallet connecting on the same
 * browser can see disputes where they are the subject — no manual lookup needed.
 */
export function useDisputeNotifications(walletAddress: string | null) {
  const [disputes, setDisputes] = useState<DisputeRecord[]>(loadDisputes)

  // Pending disputes where the connected wallet is the subject
  const pendingAgainstMe = useMemo(() =>
    disputes.filter(
      d => !d.outcome && d.subject.toLowerCase() === (walletAddress?.toLowerCase() ?? ''),
    ),
    [disputes, walletAddress],
  )

  // All disputes involving the connected wallet as subject (for profile stats)
  const countsForAddress = useCallback((address: string): DisputeCounts => {
    const mine = disputes.filter(
      d => d.subject.toLowerCase() === address.toLowerCase(),
    )
    const accepted  = mine.filter(d => d.outcome === 'accepted').length
    const dismissed = mine.filter(d => d.outcome === 'dismissed').length
    const pending   = mine.filter(d => !d.outcome).length
    return { accepted, dismissed, pending, total: mine.length }
  }, [disputes])

  const myCounts = useMemo(() =>
    walletAddress ? countsForAddress(walletAddress) : { accepted: 0, dismissed: 0, pending: 0, total: 0 },
    [walletAddress, countsForAddress],
  )

  useEffect(() => {
    // Sync from storage on mount / across tabs
    const handler = () => setDisputes(loadDisputes())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const addDispute = useCallback((record: Omit<DisputeRecord, 'timestamp'>) => {
    setDisputes(prev => {
      const exists = prev.some(
        d => d.subject.toLowerCase() === record.subject.toLowerCase()
          && d.attester.toLowerCase() === record.attester.toLowerCase(),
      )
      if (exists) return prev
      const next = [...prev, { ...record, timestamp: Date.now() }]
      saveDisputes(next)
      return next
    })
  }, [])

  const markSettled = useCallback((subject: string, attester: string, outcome: 'accepted' | 'dismissed') => {
    setDisputes(prev => {
      const next = prev.map(d =>
        d.subject.toLowerCase() === subject.toLowerCase()
        && d.attester.toLowerCase() === attester.toLowerCase()
          ? { ...d, outcome }
          : d,
      )
      saveDisputes(next)
      return next
    })
  }, [])

  const dismissNotification = useCallback((subject: string, attester: string) => {
    // Just hide the notification — doesn't change outcome
    markSettled(subject, attester, 'dismissed')
  }, [markSettled])

  return {
    disputes,
    pendingAgainstMe,
    myCounts,
    countsForAddress,
    addDispute,
    markSettled,
    dismissNotification,
  }
}
