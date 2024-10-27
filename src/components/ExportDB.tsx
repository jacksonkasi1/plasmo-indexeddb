import { useState } from "react"

type ExportDBProps = {
  databases: string[]
  setDatabases: (databases: string[]) => void
  selectedDb: string | null
  setSelectedDb: (db: string) => void
}

const ExportDB = ({
  databases,
  setDatabases,
  selectedDb,
  setSelectedDb
}: ExportDBProps) => {
  const handleExportClick = async () => {
    chrome.runtime.sendMessage({ action: "listDatabases" }, (response) => {
      if (response.databases && response.databases.length > 0) {
        setDatabases(response.databases)
      } else {
        alert("No databases available for export.")
      }
    })
  }

  const handleExportSelectedDb = () => {
    if (selectedDb) {
      chrome.runtime.sendMessage(
        { action: "exportDatabase", dbName: selectedDb },
        (response) => {
          if (response.success) alert("Database exported successfully!")
          else alert("Error exporting the database.")
        }
      )
    }
  }

  return (
    <div>
      <button className="btn mb-2" onClick={handleExportClick}>
        Export DB
      </button>

      {databases.length > 0 && (
        <div className="mb-2">
          <select
            className="p-2 border rounded w-full"
            onChange={(e) => setSelectedDb(e.target.value)}
            value={selectedDb || ""}>
            <option value="" disabled>
              Select a database
            </option>
            {databases.map((db) => (
              <option key={db} value={db}>
                {db}
              </option>
            ))}
          </select>
          <button className="btn mt-2" onClick={handleExportSelectedDb}>
            Export Selected DB
          </button>
        </div>
      )}
    </div>
  )
}

export default ExportDB
