import { useEffect } from 'react'
import { useToast } from '../contexts/ToastContext'
import { setupApiErrorHandler } from '../services/api'

export default function ApiErrorSetup() {
  const { showError } = useToast()
  useEffect(() => {
    setupApiErrorHandler(showError)
  }, [showError])
  return null
}
