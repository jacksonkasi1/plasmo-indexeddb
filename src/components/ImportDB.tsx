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
            if (response.success) alert("Database imported successfully!")
            else alert("Error importing the database.")
          }
        )
      }
    }
  }

  return (
    <div className="mt-4">
      <button className="btn mb-2">Import DB</button>
      <input type="file" className="mt-2 block" onChange={handleFileChange} />
    </div>
  )
}

export default ImportDB
