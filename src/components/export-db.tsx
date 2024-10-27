// export-db.tsx

import React, { useState } from "react"

const ExportDB = () => {
  const [databases, setDatabases] = useState<string[]>([])
  const [selectedDbs, setSelectedDbs] = useState<Set<string>>(new Set())

  const fetchDatabases = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "listDatabases" },
        (response) => {
          if (chrome.runtime.lastError) {
            alert("Error: " + chrome.runtime.lastError.message)
            return
          }
          setDatabases(response?.databases || [])
        }
      )
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
    <div className="px-3 bg-white">
      <button className="btn mb-4 w-full" onClick={fetchDatabases}>
        Fetch Databases
      </button>

    
      {databases && databases.length > 0 && (
        <div>
          <div className="border border-gray-100 rounded">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 border-b border-gray-100">
                    Select
                  </th>
                  <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 border-b border-gray-100">
                    Database Name
                  </th>
                </tr>
              </thead>
              <tbody>
                {databases.map((db) => (
                  <tr key={db} className="hover:bg-gray-50">
                    <td className="px-2 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedDbs.has(db)}
                        onChange={() => toggleSelection(db)}
                        className="w-3 h-3 text-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-sm text-gray-600">{db}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button
            className="btn-primary mt-4 w-full"
            onClick={exportSelectedDbs}
          >
            Export Selected
          </button>
        </div>
      )}
    </div>
  )
}

export default ExportDB
