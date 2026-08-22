'use client'

import { Printer } from 'lucide-react'

/**
 * Opens the browser's print dialog, which is also where "Save as PDF" lives.
 * Hidden in the printed output by the @media print rules in globals.css.
 */
export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-primary">
      <Printer className="h-4 w-4" />
      Download / print
    </button>
  )
}
