import { useState } from "react"
import ExportDB from "./components/ExportDB"
import ImportDB from "./components/ImportDB"

import "@/style.css"

const Popup = () => {
  const [selectedDb, setSelectedDb] = useState<string | null>(null)
  const [databases, setDatabases] = useState<string[]>([])

  return (
    <div className="p-4 w-80">
      <h1 className="text-lg font-semibold mb-4">IndexedDB Manager</h1>

      <ExportDB
        databases={databases}
        setDatabases={setDatabases}
        selectedDb={selectedDb}
        setSelectedDb={setSelectedDb}
      />

      <ImportDB />
    </div>
  )
}

export default Popup
