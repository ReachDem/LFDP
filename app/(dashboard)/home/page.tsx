'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {


  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-500">Centre de Commandes</h1>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {/* {items.length > 0 && ( */}
            <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[1.25rem] min-h-[1.25rem] flex items-center justify-center">
              {/* {items.reduce((sum, item) => sum + item.quantity, 0)} */}
            </Badge>
          {/* )} */}
        </Button>
      </div>

     
    </div>
  )
}
