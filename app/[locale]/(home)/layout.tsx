import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-col min-h-screen bg-border '>
      <div className='sticky top-0 z-50 bg-header-darker border-b border-white/10'>
        <Header />
      </div>
      <main className='flex-1 flex flex-col bg-border'>{children}</main>
      <Footer />
    </div>
  )
}
