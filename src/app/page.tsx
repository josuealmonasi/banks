'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import UseGetBanks from './hooks/useGetBanks'
import type { Bank, SortDirection } from './types'
import { ASCENDING, DESCENDING } from './consts'

export default function Home() {
  const { data, error, isLoading } = UseGetBanks()
  const [banks, setBanks] = useState<Array<Bank>>([])
  const [deletedBanks, setDeletedBanks] = useState<Array<string>>([]) // Keep track of the deleted banks
  const [sortDirection, setSortDirection] = useState<SortDirection>(ASCENDING)
  const [searchValue, setSearchValue] = useState<string>('')

  const handleSort = (key: keyof Bank, direction: SortDirection) => {
    setBanks(
      [...banks].sort((a, b) => {
        if (direction === ASCENDING) {
          if (a[key] < b[key]) return -1
          if (a[key] > b[key]) return 1
        } else if (direction === DESCENDING) {
          if (a[key] > b[key]) return -1
          if (a[key] < b[key]) return 1
        }
        return 0
      }),
    )
    setSortDirection(direction === ASCENDING ? DESCENDING : ASCENDING)
  }

  const handleDeleteBank = (bankName: string) => {
    setBanks(banks.filter(bank => bank.bankName !== bankName))
    const deletedBank = banks.find(bank => bank.bankName === bankName)
    if (deletedBank) setDeletedBanks([...deletedBanks, deletedBank.bankName])
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)

    setBanks(
      (data ?? []).filter(
        bank =>
          bank.bankName.toLowerCase().includes(e.target.value.toLowerCase()) &&
          deletedBanks.indexOf(bank.bankName) === -1,
      ),
    )
  }

  const handleReload = () => {
    setBanks(data ?? [])
    setSearchValue('')
    setDeletedBanks([])
  }

  useEffect(() => {
    if (data) {
      setBanks(data)
    }
  }, [data])

  if (error) return <div>Error!</div>
  if (isLoading) return <div>Loading...</div>

  return (
    <>
      <input
        value={searchValue}
        onChange={handleSearch}
        type='search'
        placeholder='Search...'
      />{' '}
      <button onClick={handleReload}>Reload</button>
      {banks.length === 0 ? (
        <div>No banks found</div>
      ) : (
        <div>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>
                  Bank Name{' '}
                  <button onClick={() => handleSort('bankName', sortDirection)}>
                    {sortDirection === ASCENDING ? '▲' : '▼'}
                  </button>
                </th>
                <th>Age</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {banks.map(bank => (
                <tr key={bank.bankName}>
                  <td>
                    <Image src={bank.url} width={80} height={50} alt='Bank Logo' />
                  </td>
                  <td>{bank.bankName}</td>
                  <td>{bank.age}</td>
                  <td>{bank.description}</td>
                  <td>
                    <button onClick={() => handleDeleteBank(bank.bankName)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
