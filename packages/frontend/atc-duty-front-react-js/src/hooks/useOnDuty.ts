import { useEffect } from 'react'
import { useOnDutyStore } from '../store/onDuty.store'

export const useOnDuty = () => {
  const { list, loading, fetch, leaveDuty } = useOnDutyStore()

  useEffect(() => {
    fetch()
  }, [fetch])

  return {
    list,
    loading,
    leave: leaveDuty,
    refresh: fetch,
  }
}