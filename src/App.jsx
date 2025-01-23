import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function App() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);

  const handleFile1Upload = (e) => setFile1(e.target.files[0]);
  const handleFile2Upload = (e) => setFile2(e.target.files[0]);

  const compareExcelFiles = async () => {
    if (!file1 || !file2) {
      alert("Please upload two Excel files!");
      return;
    }

    const readExcel = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet);
          resolve(json);
        };
        reader.readAsArrayBuffer(file);
      });
    };

    const originalData = await readExcel(file1);
    const updatedData = await readExcel(file2);

    const keyColumn = "id"; // Adjust as necessary
    const originalIds = originalData.map((row) => row[keyColumn]);
    const newEntries = updatedData.filter(
      (row) => !originalIds.includes(row[keyColumn])
    );

    if (newEntries.length === 0) {
      alert("No new entries found!");
      return;
    }

    const filteredEntries = newEntries.map(({ profileUrl, fullName }) => ({
      profileUrl,
      fullName,
    }));

    const worksheet = XLSX.utils.json_to_sheet(filteredEntries);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "New Entries");

    const currentDate = new Date()
      .toLocaleDateString("en-US", { month: "short", day: "2-digit" })
      .replace(/\s+/g, "")
      .toLowerCase();

    const outputFilename = `coachbrodiecasa_followers-${currentDate}.xlsx`;
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, outputFilename);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
        backgroundColor: "black",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          backgroundColor: "#242424",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          Excel File Comparator
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Yesterday&apos;s File
              </label>
              <span
                style={{
                  fontSize: "12px",
                  color: "#666",
                  backgroundColor: "#f0f0f0",
                  padding: "2px 8px",
                  borderRadius: "12px",
                }}
              >
                Yesterday
              </span>
            </div>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFile1Upload}
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                width: "100%",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Today&apos;s File
              </label>
              <span
                style={{
                  fontSize: "12px",
                  color: "#666",
                  backgroundColor: "#f0f0f0",
                  padding: "2px 8px",
                  borderRadius: "12px",
                }}
              >
                Today
              </span>
            </div>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFile2Upload}
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                width: "100%",
              }}
            />
          </div>

          <button
            onClick={compareExcelFiles}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            Compare Files
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
