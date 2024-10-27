// ** import components
import ExportDB from "@/components/ExportDB"
import ImportDB from "@/components/ImportDB"

import "@/style.css"

const Popup = () => {
  return (
    <div className="p-2 w-80 bg-white">
      <h1 className="text-sm text-center text-gray-600 mb-3 font-medium">
        IndexedDB Manager
      </h1>
      <div className="space-y-6">
        <ImportDB />
        <ExportDB />
      </div>
    </div>
  )
}

export default Popup
