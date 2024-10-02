import React, { useCallback } from "react";
import { Button } from "react-bootstrap";
import * as XLSX from "xlsx";

export interface Props {
  csvData: any[];
  fileName: string;
}

export const ExportCSV: React.FC<Props> = ({ csvData, fileName }) => {

  // Move the exportToCSV logic inside the Button component
  const handleExport = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, fileName);
  }, [csvData, fileName]);

  return (
    <Button onClick={handleExport}>Exportar</Button>
  );
};
