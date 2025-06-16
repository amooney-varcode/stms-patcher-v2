// @ts-nocheck
import { Parser } from 'json2csv';
import { saveAs } from 'file-saver';

export const undefinedGuard = <T>(value: T | undefined | null): value is T => (value || false) as boolean;

export function _arrayBufferToBase64(buffer: ArrayBuffer) {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	// eslint-disable-next-line no-plusplus
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
}

export const isFieldVInvlidInExcel = (field: { [key: string]: string | undefined }) => {
	if (!field['Record ID']) return 'Record ID';

	if (!field.Date) return 'Date';

	if (!field.Time) return 'Time';

	if (!field.Model) return 'Model';

	if (!field.Temperature) return 'Temperature';

	if (!field['Box number']) return 'Box number';

	if (!field['Order number']) return 'Order number';

	if (!field.Customer) return 'Customer';

	if (!field['Customer ID']) return 'Customer ID';

	if (!field['Ink volume']) return 'Ink volume';

	return false;
};

export function downloadCSV(jsonArray, filename) {
	const parser = new Parser({ header: true });
	let csv = '';

	jsonArray.forEach((item) => {
		// Convert box to CSV
		csv += parser.parse([item.box]);
		csv += '\n';

		// Convert labels to CSV
		csv += parser.parse(item.duplicatedLabels);
		csv += '\n\n'; // Add extra newline to separate each box-labels combo
	});

	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	saveAs(blob, filename);
}
