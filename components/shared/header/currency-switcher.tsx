'use client'

import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDownIcon } from 'lucide-react'
import useSettingStore from '@/hooks/use-setting-store'
import { setCurrencyOnServer } from '@/lib/actions/setting.actions'
import { useRouter } from 'next/navigation'

export default function CurrencySwitcher() {
  const {
    setting: { availableCurrencies, currency },
    setCurrency,
  } = useSettingStore()
  const [loading, setLoading] = React.useState(false) // Add loading state
  const router = useRouter()

  const handleCurrencyChange = async (newCurrency: string) => {
    setLoading(true) // Show loading screen
    try {
      await setCurrencyOnServer(newCurrency)
      setCurrency(newCurrency)
      router.refresh() // Refresh the page to reflect changes
    } finally {
      setLoading(false) // Hide loading screen
    }
  }

  const selectedCurrency = availableCurrencies.find((c) => c.code === currency)

  return (
    <>
      {loading && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/50 z-50'>
          <div className='text-white text-lg'>Loading...</div>
        </div>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          className='header-button h-[41px]'
          aria-label={`Current currency: ${currency}. Click to change currency`}
          aria-expanded={false}
          aria-haspopup='menu'
          role='button'
        >
          <div className='flex items-center gap-1'>
            <span className='text-xl' aria-hidden='true'>
              {selectedCurrency?.symbol}
            </span>
            <span className='hidden sm:inline'>{currency}</span>
            <ChevronDownIcon aria-hidden='true' />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className='w-56'
          role='menu'
          aria-label='Currency selection menu'
        >
          <DropdownMenuLabel>Currency</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={currency}
            onValueChange={handleCurrencyChange}
          >
            {availableCurrencies.map((c) => (
              <DropdownMenuRadioItem
                key={c.name}
                value={c.code}
                role='menuitemradio'
                aria-label={`Change currency to ${c.code} (${c.name})`}
              >
                {c.symbol} {c.code}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
