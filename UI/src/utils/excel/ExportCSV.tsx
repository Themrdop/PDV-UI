import React from "react";
import { Button } from "react-bootstrap";

import * as XLSX from "xlsx";

export interface Props {
    csvData: any[];
    fileName: string;
  }

export const ExportCSV: React.FC<Props> = ({csvData, fileName}) => {

  const exportToCSV = (csvData: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Button onClick={(e) => exportToCSV(csvData, fileName)}>Exportar</Button>
  );
};
