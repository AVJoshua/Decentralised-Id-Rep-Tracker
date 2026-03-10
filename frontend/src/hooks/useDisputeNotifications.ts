import { useState, useEffect, useCallback } from 'react'

export interface DisputeRecord {
  subject: string
  attester: string
  raiser: string
  timestamp: number
  settled?: boolean
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
 * Tracks raised disputes in localStorage so the subject address
 * can be notified when they connect their wallet.
 */
export function useDisputeNotifications(walletAddress: string | null) {
  const [disputes, setDisputes] = useState<DisputeRecord[]>(loadDisputes)

  // Pending disputes where the connected wallet is the subject
  const pendingAgainstMe = disputes.filter(
    d => !d.settled && d.subject.toLowerCase() === (walletAddress?.toLowerCase() ?? ''),
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

  const markSettled = useCallback((subject: string, attester: string) => {
    setDisputes(prev => {
      const next = prev.map(d =>
        d.subject.toLowerCase() === subject.toLowerCase()
        && d.attester.toLowerCase() === attester.toLowerCase()
          ? { ...d, settled: true }
          : d,
      )
      saveDisputes(next)
      return next
    })
  }, [])

  const dismissNotification = useCallback((subject: string, attester: string) => {
    markSettled(subject, attester)
  }, [markSettled])

  return { disputes, pendingAgainstMe, addDispute, markSettled, dismissNotification }
}
