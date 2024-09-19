const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const xlsx = require('xlsx');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

let votes = {}; // เก็บข้อมูลการลงคะแนนในหน่วยความจำ (ควรใช้ฐานข้อมูลในกรณีจริง)

// ฟังก์ชันเพื่อบันทึกข้อมูลลงไฟล์ Excel
function saveToExcel(data) {
    const filePath = './votes.xlsx';

    let workbook;
    if (fs.existsSync(filePath)) {
        workbook = xlsx.readFile(filePath);
    } else {
        workbook = xlsx.utils.book_new();
    }

    const sheetName = 'Votes';
    let worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
        worksheet = xlsx.utils.aoa_to_sheet([['Vote']]);
        xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    const newRow = [data.vote];
    const sheetData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    sheetData.push(newRow);

    const newWorksheet = xlsx.utils.aoa_to_sheet(sheetData);
    workbook.Sheets[sheetName] = newWorksheet;

    xlsx.writeFile(workbook, filePath);
}

// API เพื่อรับข้อมูลการลงคะแนน
app.post('/vote', (req, res) => {
    const { vote } = req.body;
    const ipAddress = req.ip;

    if (votes[ipAddress]) {
        return res.json({ success: false, message: 'คุณได้ลงคะแนนแล้ว' });
    }

    votes[ipAddress] = true;
    saveToExcel({ vote });

    res.json({ success: true, message: 'การลงคะแนนสำเร็จ' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
