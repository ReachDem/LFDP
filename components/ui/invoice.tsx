"use client"

import { useRef } from "react"
import { Printer, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useReactToPrint } from "react-to-print"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { CustomerRecord } from "@/services/types"
import { OrderItem } from "@/store/order.store"

interface InvoiceProps {
  customer: CustomerRecord
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
}

export function Invoice({ customer, items, subtotal, tax, total }: InvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`
  const currentDate = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice-${invoiceNumber}`,
  });

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 1,
      logging: false,
      useCORS: true,
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
    pdf.save(`Invoice-${invoiceNumber}.pdf`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XAF',
      minimumFractionDigits: 0 
    }).format(price)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePrint()}
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimer
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          Télécharger PDF
        </Button>
      </div>

      <div ref={invoiceRef} className="border rounded-md p-4 text-sm bg-white">
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold">FACTURE</h2>
            <p className="text-muted-foreground">{invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold">La Force du planteur</h3>
            <p>123 Business Street</p>
            <p>Business City, 12345</p>
            <p>contact@laforceduplanteur.cm</p>
            <p>N° RC 1234/098</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-semibold mb-1">Facturer à:</h4>
            <p className="font-medium">{customer.name}</p>
            <p>{customer.address}</p>
            <p>{customer.email}</p>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-1">
              <p className="font-semibold">Date de facturation:</p>
              <p>{currentDate}</p>
              <p className="font-semibold">Date d&apos;échéance:</p>
              <p>{dueDate}</p>
              <p className="font-semibold">Conditions de paiement:</p>
              <p>Net 30</p>
            </div>
          </div>
        </div>

        <table className="w-full mb-6">
          <thead className="border-b">
            <tr className="text-left">
              <th className="pb-2">Article</th>
              <th className="pb-2 text-right">Qté</th>
              <th className="pb-2 text-right">Prix unitaire</th>
              <th className="pb-2 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.name}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatPrice(item.price)}</td>
                <td className="py-2 text-right">{formatPrice(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-1/2">
            <div className="flex justify-between py-1">
              <span>Sous-total:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>TVA (19.25%):</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between py-1 font-bold">
              <span>Total:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <div className="text-sm mt-6 pt-4 border-t">
          <h4 className="font-semibold mb-2">Informations de paiement:</h4>
          <p>Banque: Banque Nationale</p>
          <p>Nom du compte: La force du planteur.</p>
          <p>Numéro de compte: XXXX-XXXX-XXXX-1234</p>
          <p>SWIFT/BIC: NTBNKXX</p>

          <p className="mt-4 text-muted-foreground">
            Veuillez inclure le numéro de facture dans votre référence de paiement. Le paiement est dû dans les 30 jours
            suivant la date de facturation.
          </p>
        </div>
      </div>
    </div>
  )
}
