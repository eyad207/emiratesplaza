import { Metadata } from 'next'
import Link from 'next/link'

import { auth } from '@/auth'
import DeleteDialog from '@/components/shared/delete-dialog'
import Pagination from '@/components/shared/pagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  deleteAllOrders,
  deleteOrder,
  getAllOrders,
} from '@/lib/actions/order.actions'
import { formatDateTime } from '@/lib/utils'
import { IOrderList } from '@/types'
import ProductPrice from '@/components/shared/product/product-price'
import FilterInput from './FilterInput'
import {
  ShoppingBag,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Calendar,
  CreditCard,
  Truck,
  User,
  Hash,
  AlertCircle,
  Search,
  Trash2,
  ExternalLink,
  BarChart3,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Orders',
}

export default async function OrdersPage(props: {
  searchParams: Promise<{
    page?: string
    orderId?: string
    sort?: string
    order?: string
  }>
}) {
  const searchParams = await props.searchParams

  const {
    page = '1',
    orderId = '',
    sort = 'createdAt',
    order = 'desc',
  } = searchParams

  const session = await auth()
  if (session?.user.role !== 'Admin')
    throw new Error('Admin permission required')

  const orders = await getAllOrders({
    page: Number(page),
    orderId,
    sort,
    order,
  })

  // Calculate stats
  const totalOrders = orders.data.length
  const paidOrders = orders.data.filter((order) => order.isPaid).length
  const deliveredOrders = orders.data.filter(
    (order) => order.isDelivered
  ).length
  const newOrders = orders.data.filter((order) => !order.viewed).length
  const totalRevenue = orders.data
    .filter((order) => order.isPaid)
    .reduce((sum, order) => sum + order.totalPrice, 0)

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6'>
      <div className='max-w-7xl mx-auto space-y-8'>
        {/* Premium Header */}
        <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50'>
          <div className='absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20' />
          <CardHeader className='relative pb-8'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6'>
              <div className='flex items-center gap-4'>
                <div className='p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-xl'>
                  <ShoppingBag className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-slate-900 dark:text-slate-100'>
                    Order Management
                  </h1>
                  <p className='text-slate-600 dark:text-slate-400 mt-1'>
                    Monitor and manage customer orders with advanced filtering
                  </p>
                </div>
              </div>
              <form action={deleteAllOrders}>
                <Button
                  variant='destructive'
                  type='submit'
                  className='group relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 py-3 font-semibold rounded-xl'
                >
                  <div className='absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300' />
                  <div className='relative flex items-center gap-2'>
                    <Trash2 className='h-4 w-4' />
                    Delete All Orders
                  </div>
                </Button>
              </form>
            </div>
          </CardHeader>
        </Card>

        {/* Premium Stats Dashboard */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
          <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl shadow-blue-200/30 dark:shadow-slate-900/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105'>
            <div className='absolute inset-0 bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/20' />
            <CardContent className='relative p-6 text-center'>
              <div className='flex justify-center mb-3'>
                <div className='p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg'>
                  <BarChart3 className='h-6 w-6 text-white' />
                </div>
              </div>
              <div className='text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1'>
                {totalOrders}
              </div>
              <div className='text-sm font-medium text-slate-600 dark:text-slate-400'>
                Total Orders
              </div>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl shadow-green-200/30 dark:shadow-slate-900/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105'>
            <div className='absolute inset-0 bg-gradient-to-br from-green-50/80 to-green-100/80 dark:from-green-900/20 dark:to-green-800/20' />
            <CardContent className='relative p-6 text-center'>
              <div className='flex justify-center mb-3'>
                <div className='p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg'>
                  <CreditCard className='h-6 w-6 text-white' />
                </div>
              </div>
              <div className='text-3xl font-bold text-green-600 dark:text-green-400 mb-1'>
                {paidOrders}
              </div>
              <div className='text-sm font-medium text-slate-600 dark:text-slate-400'>
                Paid Orders
              </div>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl shadow-purple-200/30 dark:shadow-slate-900/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105'>
            <div className='absolute inset-0 bg-gradient-to-br from-purple-50/80 to-purple-100/80 dark:from-purple-900/20 dark:to-purple-800/20' />
            <CardContent className='relative p-6 text-center'>
              <div className='flex justify-center mb-3'>
                <div className='p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg'>
                  <Truck className='h-6 w-6 text-white' />
                </div>
              </div>
              <div className='text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1'>
                {deliveredOrders}
              </div>
              <div className='text-sm font-medium text-slate-600 dark:text-slate-400'>
                Delivered
              </div>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl shadow-orange-200/30 dark:shadow-slate-900/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105'>
            <div className='absolute inset-0 bg-gradient-to-br from-orange-50/80 to-orange-100/80 dark:from-orange-900/20 dark:to-orange-800/20' />
            <CardContent className='relative p-6 text-center'>
              <div className='flex justify-center mb-3'>
                <div className='p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg'>
                  <AlertCircle className='h-6 w-6 text-white' />
                </div>
              </div>
              <div className='text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1'>
                {newOrders}
              </div>
              <div className='text-sm font-medium text-slate-600 dark:text-slate-400'>
                New Orders
              </div>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl shadow-emerald-200/30 dark:shadow-slate-900/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105'>
            <div className='absolute inset-0 bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 dark:from-emerald-900/20 dark:to-emerald-800/20' />
            <CardContent className='relative p-6 text-center'>
              <div className='flex justify-center mb-3'>
                <div className='p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg'>
                  <DollarSign className='h-6 w-6 text-white' />
                </div>
              </div>
              <div className='text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1'>
                <ProductPrice price={totalRevenue} plain />
              </div>
              <div className='text-sm font-medium text-slate-600 dark:text-slate-400'>
                Total Revenue
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filter Section */}
        <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50'>
          <div className='absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-700/50' />
          <CardContent className='relative p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='p-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg shadow-md'>
                <Search className='h-5 w-5 text-white' />
              </div>
              <h3 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
                Order Filters
              </h3>
            </div>
            <FilterInput defaultValue={orderId} />
          </CardContent>
        </Card>
        {/* Premium Orders Table */}
        <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50'>
          <div className='absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-700/50' />
          <CardHeader className='relative pb-6'>
            <div className='flex items-center gap-3'>
              <div className='p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg'>
                <Package className='h-6 w-6 text-white' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
                  Orders Overview
                </h2>
                <p className='text-slate-600 dark:text-slate-400'>
                  Comprehensive order management with advanced sorting
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className='relative p-0'>
            {orders.data.length === 0 ? (
              <div className='text-center py-16'>
                <div className='flex flex-col items-center gap-4'>
                  <ShoppingBag className='h-16 w-16 text-slate-300 dark:text-slate-600' />
                  <div>
                    <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                      No orders found
                    </h3>
                    <p className='text-slate-500 dark:text-slate-400'>
                      Try adjusting your search criteria or check back later
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow className='border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-800/80 dark:to-slate-700/80'>
                      <TableHead className='px-6 py-5 font-bold text-slate-800 dark:text-slate-200'>
                        <Link
                          href={{
                            pathname: '/admin/orders',
                            query: {
                              page,
                              orderId,
                              sort: '_id',
                              order:
                                sort === '_id' && order === 'asc'
                                  ? 'desc'
                                  : 'asc',
                            },
                          }}
                          className='flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                        >
                          <Hash className='h-4 w-4' />
                          Order ID
                          {sort === '_id' && (
                            <span className='text-blue-600 dark:text-blue-400'>
                              {order === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </Link>
                      </TableHead>
                      <TableHead className='px-6 py-5 font-bold text-slate-800 dark:text-slate-200'>
                        <Link
                          href={{
                            pathname: '/admin/orders',
                            query: {
                              page,
                              orderId,
                              sort: 'createdAt',
                              order:
                                sort === 'createdAt' && order === 'asc'
                                  ? 'desc'
                                  : 'asc',
                            },
                          }}
                          className='flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                        >
                          <Calendar className='h-4 w-4' />
                          Date
                          {sort === 'createdAt' && (
                            <span className='text-blue-600 dark:text-blue-400'>
                              {order === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </Link>
                      </TableHead>
                      <TableHead className='px-6 py-5 font-bold text-slate-800 dark:text-slate-200'>
                        <div className='flex items-center gap-2'>
                          <User className='h-4 w-4' />
                          Customer
                        </div>
                      </TableHead>
                      <TableHead className='px-6 py-5 font-bold text-slate-800 dark:text-slate-200'>
                        <Link
                          href={{
                            pathname: '/admin/orders',
                            query: {
                              page,
                              orderId,
                              sort: 'totalPrice',
                              order:
                                sort === 'totalPrice' && order === 'asc'
                                  ? 'desc'
                                  : 'asc',
                            },
                          }}
                          className='flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                        >
                          <DollarSign className='h-4 w-4' />
                          Total
                          {sort === 'totalPrice' && (
                            <span className='text-blue-600 dark:text-blue-400'>
                              {order === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </Link>
                      </TableHead>
                      <TableHead className='px-6 py-5 font-bold text-slate-800 dark:text-slate-200'>
                        <div className='flex items-center gap-2'>
                          <CreditCard className='h-4 w-4' />
                          Payment
                        </div>
                      </TableHead>
                      <TableHead className='px-6 py-5 font-bold text-slate-800 dark:text-slate-200'>
                        <div className='flex items-center gap-2'>
                          <Truck className='h-4 w-4' />
                          Delivery
                        </div>
                      </TableHead>
                      <TableHead className='px-6 py-5 font-bold text-slate-800 dark:text-slate-200'>
                        <Link
                          href={{
                            pathname: '/admin/orders',
                            query: {
                              page,
                              orderId,
                              sort: 'viewed',
                              order:
                                sort === 'viewed' && order === 'asc'
                                  ? 'desc'
                                  : 'asc',
                            },
                          }}
                          className='flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                        >
                          <Eye className='h-4 w-4' />
                          Status
                          {sort === 'viewed' && (
                            <span className='text-blue-600 dark:text-blue-400'>
                              {order === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </Link>
                      </TableHead>
                      <TableHead className='px-6 py-5 font-bold text-slate-800 dark:text-slate-200'>
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.data.map((order: IOrderList) => (
                      <TableRow
                        key={order._id}
                        className='group border-b border-slate-200/60 dark:border-slate-700/60 hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-white dark:hover:from-slate-700/50 dark:hover:to-slate-800/50 transition-all duration-200'
                      >
                        <TableCell className='px-6 py-6'>
                          <div className='font-mono text-sm bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg border'>
                            {order._id.slice(-8)}
                          </div>
                        </TableCell>
                        <TableCell className='px-6 py-6'>
                          <div className='flex items-center gap-2'>
                            <Clock className='h-4 w-4 text-slate-400' />
                            <div>
                              <div className='font-semibold text-slate-900 dark:text-slate-100'>
                                {formatDateTime(order.createdAt!).dateOnly}
                              </div>
                              <div className='text-sm text-slate-500 dark:text-slate-400'>
                                {formatDateTime(order.createdAt!).timeOnly}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='px-6 py-6'>
                          <div className='flex items-center gap-2'>
                            <div className='w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center'>
                              <User className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                            </div>
                            <div>
                              <div className='font-semibold text-slate-900 dark:text-slate-100'>
                                {order.user ? order.user.name : 'Deleted User'}
                              </div>
                              {!order.user && (
                                <div className='text-xs text-red-500 dark:text-red-400'>
                                  Account removed
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='px-6 py-6'>
                          <div className='font-bold text-lg text-slate-900 dark:text-slate-100'>
                            <ProductPrice price={order.totalPrice} plain />
                          </div>
                        </TableCell>
                        <TableCell className='px-6 py-6'>
                          {order.isPaid && order.paidAt ? (
                            <div className='flex items-center gap-2'>
                              <Badge className='bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800'>
                                <CheckCircle className='h-3 w-3 mr-1' />
                                Paid
                              </Badge>
                              <div className='text-xs text-slate-500 dark:text-slate-400'>
                                {formatDateTime(order.paidAt).dateOnly}
                              </div>
                            </div>
                          ) : (
                            <Badge className='bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800'>
                              <XCircle className='h-3 w-3 mr-1' />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className='px-6 py-6'>
                          {order.isDelivered && order.deliveredAt ? (
                            <div className='flex items-center gap-2'>
                              <Badge className='bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800'>
                                <Truck className='h-3 w-3 mr-1' />
                                Delivered
                              </Badge>
                              <div className='text-xs text-slate-500 dark:text-slate-400'>
                                {formatDateTime(order.deliveredAt).dateOnly}
                              </div>
                            </div>
                          ) : (
                            <Badge className='bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800'>
                              <Package className='h-3 w-3 mr-1' />
                              Processing
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className='px-6 py-6'>
                          {order.viewed ? (
                            <Badge className='bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-600'>
                              <Eye className='h-3 w-3 mr-1' />
                              Viewed
                            </Badge>
                          ) : (
                            <Badge className='bg-gradient-to-r from-red-50 to-pink-50 text-red-700 dark:from-red-900/20 dark:to-pink-900/20 dark:text-red-400 border-red-200 dark:border-red-800 animate-pulse'>
                              <EyeOff className='h-3 w-3 mr-1' />
                              New!
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className='px-6 py-6'>
                          <div className='flex gap-2'>
                            <Button
                              asChild
                              className='group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 py-2 text-sm font-medium rounded-lg'
                            >
                              <Link href={`/admin/orders/${order._id}`}>
                                <div className='absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300' />
                                <div className='relative flex items-center gap-2'>
                                  <ExternalLink className='h-4 w-4' />
                                  Details
                                </div>
                              </Link>
                            </Button>
                            <DeleteDialog id={order._id} action={deleteOrder} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {orders.totalPages > 1 && (
              <div className='px-6 py-4 border-t border-slate-200/60 dark:border-slate-700/60'>
                <Pagination page={page} totalPages={orders.totalPages!} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
