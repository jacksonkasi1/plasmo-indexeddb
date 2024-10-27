import React from "react"

const ImportDB = () => {
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      const jsonData = await file.text()
      const dbName = prompt("Enter the name for the new database:")
      if (dbName) {
        chrome.runtime.sendMessage(
          { action: "importDatabase", dbName, jsonData },
          (response) => {
            if (chrome.runtime.lastError) {
              alert(
                `Error importing the database: ${chrome.runtime.lastError.message}`
              )
            } else if (response.error) {
              alert(`Error importing the database: ${response.error}`)
            } else {
              alert("Database imported successfully!")
            }
          }
        )
      }
    }
  }

  return (
    <div className="px-3">
      <button
        className="btn"
        onClick={() => document.getElementById("importFileInput")?.click()}>
        Import DB
      </button>
      <input
        type="file"
        id="importFileInput"
        className="mt-2 block"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  )
}

export default ImportDB
