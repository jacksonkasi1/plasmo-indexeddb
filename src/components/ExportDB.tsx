// ExportDB.tsx
import React, { useState } from "react"

type ExportDBProps = {
  databases: string[]
  setDatabases: (databases: string[]) => void
}

const ExportDB: React.FC<ExportDBProps> = ({ databases, setDatabases }) => {
  const [selectedDbs, setSelectedDbs] = useState<Set<string>>(new Set())

  const fetchDatabases = () => {
    console.log("Fetching databases...")
    chrome.runtime.sendMessage({ action: "listDatabases" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error fetching databases:",
          chrome.runtime.lastError.message
        )
        alert("Error fetching databases: " + chrome.runtime.lastError.message)
      } else if (response.error) {
        console.error("Error fetching databases:", response.error)
        alert("Error fetching databases: " + response.error)
      } else {
        console.log("Databases fetched successfully:", response.databases)
        setDatabases(response.databases || [])
        if (!response.databases?.length) {
          alert("No databases available for export.")
        }
      }
    })
  }

  const toggleSelection = (dbName: string) => {
    setSelectedDbs((prev) => {
      const newSelection = new Set(prev)
      if (newSelection.has(dbName)) {
        newSelection.delete(dbName)
      } else {
        newSelection.add(dbName)
      }
      return newSelection
    })
  }

  const exportSelectedDbs = () => {
    selectedDbs.forEach((dbName) => {
      chrome.runtime.sendMessage(
        { action: "exportDatabase", dbName },
        (response) => {
          if (chrome.runtime.lastError) {
            alert(
              `Failed to export ${dbName}: ${chrome.runtime.lastError.message}`
            )
          } else if (response.error) {
            alert(`Failed to export ${dbName}: ${response.error}`)
          } else {
            const blob = new Blob([response.json], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            chrome.downloads.download({
              url,
              filename: `${dbName}.json`,
              saveAs: true
            })
            console.log(`Exported ${dbName}`)
          }
        }
      )
    })
  }

  return (
    <div className="min-w-[300px] min-h-[400px] p-4 bg-white">
      <button className="btn mb-4 w-full" onClick={fetchDatabases}>
        Fetch Databases
      </button>

      {databases.length > 0 && (
        <div>
          <table className="w-full border rounded-md shadow-sm">
            <thead>
              <tr>
                <th className="py-2 border-b text-left">Select</th>
                <th className="py-2 border-b text-left">Database Name</th>
              </tr>
            </thead>
            <tbody>
              {databases.map((db) => (
                <tr key={db}>
                  <td className="px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={selectedDbs.has(db)}
                      onChange={() => toggleSelection(db)}
                      className="form-checkbox"
                    />
                  </td>
                  <td className="px-2 py-1">{db}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn mt-4 w-full" onClick={exportSelectedDbs}>
            Export Selected
          </button>
        </div>
      )}
    </div>
  )
}

export default ExportDB
