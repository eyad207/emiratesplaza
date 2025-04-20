import Image from 'next/image'
import Link from 'next/link'
import { getAllCategories } from '@/lib/actions/product.actions'
import Menu from './menu'
import Search from './search'
import Sidebar from './sidebar'
import { getSetting } from '@/lib/actions/setting.actions'
import { EllipsisVerticalIcon, TagIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Tag from '@/lib/db/models/tag.model'
import { connectToDatabase } from '@/lib/db'

export default async function Header() {
  await connectToDatabase()
  const tags = await Tag.find().sort({ name: 1 }).lean()
  const categories = await getAllCategories()
  const { site } = await getSetting()

  // Popular links to show on mobile
  const mobileLinks = tags.slice(0, 3).map((tag) => ({
    name: tag.name,
    href: `/search?tag=${tag._id}`,
  }))

  return (
    <header className='bg-header text-white shadow-md w-full'>
      {/* Main header row */}
      <div className='w-full px-3 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between py-2 sm:py-3'>
          {/* Left section with logo */}
          <div className='flex items-center shrink-0'>
            <Link
              href='/'
              className='flex items-center gap-2 rounded-md hover:bg-white/10 transition-all duration-200 px-1.5 py-1'
            >
              <Image
                src={site.logo}
                width={32}
                height={32}
                alt={`${site.name} logo`}
                className='h-8 w-8 sm:h-9 sm:w-9'
                priority
              />
              <span className='hidden xs:inline font-bold text-lg xs:text-xl'>
                {site.name}
              </span>
            </Link>
          </div>

          {/* Center section with search - conditionally styled for different screen sizes */}
          <div className='flex-1 px-2 max-w-xl mx-auto'>
            {/* Search is always visible but styled differently based on screen size */}
            <Search compact={true} />
          </div>

          {/* Menu with user controls */}
          <div className='flex-shrink-0 hidden nav:flex'>
            <Menu />
          </div>

          {/* Mobile menu button */}
          <div className='nav:hidden flex items-center'>
            <Menu />
          </div>
        </div>
      </div>

      {/* Navigation bar - Full width */}
      <div className='w-full bg-header-darker border-t border-white/10'>
        <div className='flex items-center justify-between py-2 px-3 sm:px-6 lg:px-8 max-w-[2000px] mx-auto'>
          {/* Sidebar trigger (categories) */}
          <div className='flex-shrink-0'>
            <Sidebar categories={categories} />
          </div>

          {/* Desktop nav links */}
          <div className='hidden nav:flex items-center flex-wrap gap-x-6 overflow-hidden px-4'>
            {tags.map((tag) => (
              <Link
                href={`/search?tag=${tag._id}`}
                key={String(tag._id)}
                className='text-sm font-medium whitespace-nowrap py-2 border-b-2 border-transparent hover:border-primary hover:text-primary transition-all duration-200'
              >
                {tag.name}
              </Link>
            ))}
          </div>

          {/* Mobile popular links - Visible on smaller screens */}
          <div className='nav:hidden flex items-center overflow-x-auto scrollbar-hide gap-3 px-2'>
            {mobileLinks.map((menu) => (
              <Link
                href={menu.href}
                key={menu.href}
                className='flex items-center whitespace-nowrap text-xs py-1 px-2 hover:bg-primary/10 rounded-md transition-colors'
              >
                <TagIcon className='h-3 w-3 mr-1' />
                {menu.name}
              </Link>
            ))}
          </div>

          {/* Mobile/tablet menu dropdown */}
          <div className='nav:hidden flex items-center'>
            <DropdownMenu>
              <DropdownMenuTrigger className='rounded-md hover:bg-white/10 transition-colors p-1.5'>
                <EllipsisVerticalIcon className='h-5 w-5' />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='min-w-[200px] z-50 rounded-md'
              >
                {tags
                  .filter(
                    (tag) => !mobileLinks.some((m) => m.name === tag.name)
                  )
                  .map((tag) => (
                    <DropdownMenuItem
                      key={String(tag._id)}
                      asChild
                      className='cursor-pointer focus:bg-primary/10'
                    >
                      <Link
                        href={`/search?tag=${tag._id}`}
                        className='w-full py-1.5'
                      >
                        {tag.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
