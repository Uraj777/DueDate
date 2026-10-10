/**
 * DueDate - CSV Parser & Importer Engine (JavaScript)
 * Cleans inputs, skips blank rows, trims whitespace, validates numbers & amounts,
 * and reports failed rows with explicit line error reasons.
 */

import { normalizePhoneNumber } from './phoneUtils.js';

export function parseMemberCSV(csvText, existingMembers = []) {
  if (!csvText || typeof csvText !== 'string') {
    return { validRows: [], failedRows: [], totalProcessed: 0 };
  }

  const lines = csvText.split(/\r?\n/);
  const validRows = [];
  const failedRows = [];
  let headerFound = false;
  let headers = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) {
      // Skip empty lines cleanly
      continue;
    }

    const cols = rawLine.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));

    // Check if line looks like header
    if (!headerFound) {
      const lower = cols.map((c) => c.toLowerCase());
      if (lower.includes('name') || lower.includes('phone') || lower.includes('fee')) {
        headers = lower;
        headerFound = true;
        continue;
      }
    }

    const rowNum = i + 1;

    // Default expected column order if no explicit header:
    // Name, Phone, Guardian Name, Batch/Class, Fee Amount, Custom Notes
    let name = '';
    let phone = '';
    let guardianName = '';
    let groupName = '';
    let feeAmount = 0;
    let customField = '';

    if (headerFound && headers.length > 0) {
      const nameIdx = headers.findIndex((h) => h.includes('name') && !h.includes('guardian'));
      const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('mobile'));
      const guardIdx = headers.findIndex((h) => h.includes('guardian') || h.includes('parent'));
      const groupIdx = headers.findIndex((h) => h.includes('group') || h.includes('class') || h.includes('batch') || h.includes('slot'));
      const feeIdx = headers.findIndex((h) => h.includes('fee') || h.includes('amount'));
      const notesIdx = headers.findIndex((h) => h.includes('note') || h.includes('custom') || h.includes('roll'));

      name = cols[nameIdx !== -1 ? nameIdx : 0] || '';
      phone = cols[phoneIdx !== -1 ? phoneIdx : 1] || '';
      guardianName = guardIdx !== -1 ? cols[guardIdx] || '' : cols[2] || '';
      groupName = groupIdx !== -1 ? cols[groupIdx] || '' : cols[3] || '';
      const feeVal = feeIdx !== -1 ? cols[feeIdx] : cols[4];
      feeAmount = parseFloat(feeVal) || 0;
      customField = notesIdx !== -1 ? cols[notesIdx] || '' : cols[5] || '';
    } else {
      name = cols[0] || '';
      phone = cols[1] || '';
      guardianName = cols[2] || '';
      groupName = cols[3] || '';
      feeAmount = parseFloat(cols[4]) || 0;
      customField = cols[5] || '';
    }

    // Validation checks
    if (!name.trim()) {
      failedRows.push({
        rowNumber: rowNum,
        raw: rawLine,
        error: 'Missing Member/Student name'
      });
      continue;
    }

    const phoneResult = normalizePhoneNumber(phone);
    if (!phoneResult.isValid) {
      failedRows.push({
        rowNumber: rowNum,
        raw: rawLine,
        error: `Invalid phone "${phone}": ${phoneResult.error}`
      });
      continue;
    }

    if (feeAmount <= 0) {
      failedRows.push({
        rowNumber: rowNum,
        raw: rawLine,
        error: `Fee amount must be greater than 0 (got "${cols[4] || ''}")`
      });
      continue;
    }

    validRows.push({
      name: name.trim(),
      phone_number: phoneResult.formatted,
      guardian_name: guardianName.trim(),
      group_name: groupName.trim() || 'General Batch',
      fee_amount: feeAmount,
      custom_field: customField.trim()
    });
  }

  return {
    validRows,
    failedRows,
    totalProcessed: validRows.length + failedRows.length
  };
}

export function generateSampleCSV(orgType = 'school') {
  if (orgType === 'gym') {
    return `Name,Phone,Emergency Contact,Workout Slot,Fee Amount,Notes
Kabir Vohra,9876543210,Sunil Vohra,Morning Crossfit (6 AM),2500,Locker 12
Ananya Sen,9823456789,Rita Sen,Evening Strength (7 PM),3000,Annual Plan
Vikram Rawat,9812345678,Meera Rawat,General Slot (8 AM),2000,Student discount`;
  }

  return `Name,Phone,Guardian Name,Class / Batch,Fee Amount,Roll Number / Notes
Aarav Gupta,9876543210,Rajesh Gupta,Class 10-A,3800,Roll #15
Diya Sharma,9823456789,Sunil Sharma,Class 10-B,3800,Roll #08
Tanmay Verma,9812345678,Anita Verma,Class 9-C,3200,Bus Route #4`;
}
