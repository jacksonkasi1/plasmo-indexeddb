import React, { useState } from "react"

const ExportDB = () => {
  const [databases, setDatabases] = useState<string[]>([])
  const [selectedDbs, setSelectedDbs] = useState<Set<string>>(new Set())

  const fetchDatabases = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0 || !tabs[0]?.id) {
        alert("No active tab found.")
        return
      }

      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "listDatabases" },
        (response) => {
          if (chrome.runtime.lastError) {
            alert(`Error: ${chrome.runtime.lastError.message}`)
            return
          }
          setDatabases((response && response.databases) || [])
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
            return
          } else if (response?.error) {
            alert(`Failed to export ${dbName}: ${response.error}`)
            return
          } else if (response?.json) {
            const blob = new Blob([response.json], { type: "application/json" })
            const url = URL.createObjectURL(blob)

            console.log(`Downloading ${dbName}.json`)

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
      <button className="w-full mb-4 btn" onClick={fetchDatabases}>
        Fetch Databases
      </button>

      {databases.length > 0 && (
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
                {databases.map((db, index) => (
                  <tr
                    key={db}
                    className="transition duration-300 ease-in-out translate-y-4 opacity-0 cursor-pointer hover:bg-gray-50"
                    style={{
                      animation: `fadeIn 0.2s ease-out forwards ${index * 0.05}s`
                    }}
                    onClick={() => {
                      toggleSelection(db)
                    }}>
                    <td className="px-2 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedDbs.has(db)}
                        onChange={() => {
                          toggleSelection(db)
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                        }} // Prevent row click event
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
            className="w-full mt-4 btn-primary"
            onClick={exportSelectedDbs}>
            Export Selected
          </button>
        </div>
      )}
    </div>
  )
}

export default ExportDB
