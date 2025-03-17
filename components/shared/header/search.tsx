import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getAllCategories } from '@/lib/actions/product.actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select'
import { getSetting } from '@/lib/actions/setting.actions'
import { getTranslations } from 'next-intl/server'

export default async function Search() {
  const {
    site: { name },
  } = await getSetting()
  const categories = await getAllCategories()

  const t = await getTranslations()
  return (
    <form
      action='/search'
      method='GET'
      className='flex items-stretch h-10 shadow-md rounded-md overflow-hidden'
    >
      <Select name='category'>
        <SelectTrigger className='w-auto min-w-[70px] xs:min-w-[80px] h-full dark:border-gray-300 bg-gray-100 text-black border-r-0 rounded-r-none rounded-l-md rtl:rounded-r-md rtl:rounded-l-none border-2'>
          <SelectValue placeholder={t('Header.All')} />
        </SelectTrigger>
        <SelectContent position='popper' className='min-w-[150px]'>
          <SelectItem value='all'>{t('Header.All')}</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        className='flex-1 rounded-none dark:border-gray-300 bg-gray-100 text-black text-sm xs:text-base h-full border-y-2 border-r-0 border-l-0 focus-visible:ring-offset-0 min-w-0'
        placeholder={t('Header.Search Site', { name })}
        name='q'
        type='search'
      />

      <button
        type='submit'
        className='bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground text-black rounded-s-none rounded-e-md h-full px-3 sm:px-4 py-2 transition-colors duration-200 border-2 border-primary'
        aria-label={t('Header.Search')}
      >
        <SearchIcon className='w-4 h-4 xs:w-5 xs:h-5' />
      </button>
    </form>
  )
}
