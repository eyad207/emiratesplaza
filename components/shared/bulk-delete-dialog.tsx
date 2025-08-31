'use client'
import { useState, useTransition } from 'react'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function BulkDeleteDialog({
  ids,
  action,
  callbackAction,
}: {
  ids: string[]
  action: (ids: string[]) => Promise<{ success: boolean; message: string }>
  callbackAction?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant='destructive'
          size='sm'
          disabled={!ids || ids.length === 0}
        >
          Delete selected
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete selected products?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the selected products. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <Button
            variant='destructive'
            size='sm'
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const res = await action(ids)
                if (!res.success) {
                  toast({ variant: 'destructive', description: res.message })
                } else {
                  setOpen(false)
                  toast({ description: res.message })
                  if (callbackAction) callbackAction()
                }
              })
            }
          >
            {isPending ? 'Deleting...' : 'Delete selected'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
