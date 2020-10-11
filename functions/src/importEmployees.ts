import * as functions from 'firebase-functions';
import * as csvParse from 'csv-parse/lib/sync';
import * as fs from 'fs';

import addEmployee from './addEmployee';

export default (filePath:string, companyId:string) => {
    const csvFilePath = filePath;
    const csvParseOptions = {
        columns: true,
        skip_empty_lines: true,
        skip_lines_with_error: true,
    };

    const CSV = fs.readFileSync(csvFilePath);

    const employeesData = csvParse(CSV, csvParseOptions);

    employeesData.forEach((employeeData:any) => {
        addEmployee(companyId, employeeData).catch(error => {
            functions.logger.error("Error importing an Employee record:", error);
        });
    });
};