import { Metadata } from 'next'
import ProductList from './product-list'

export const metadata: Metadata = {
  title: 'Product Management | Admin Dashboard',
  description: 'Manage your product inventory, pricing, and availability',
}

export default async function AdminProduct() {
  return (
    <div className='relative'>
      {/* Background Elements */}
      <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800' />
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/20 via-transparent to-yellow-100/20 dark:from-orange-900/10 dark:to-yellow-900/10' />

      {/* Content */}
      <div className='relative z-10'>
        <ProductList />
      </div>
    </div>
  )
}
