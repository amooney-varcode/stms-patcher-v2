// @ts-nocheck
import { Boxes, Labels } from '@prisma/client';
import dayjs from 'dayjs';
import { prisma } from '~/db.server';

export const prepareBox = (rawBox: Boxes) => {
	const box = {
		...rawBox,
		NoOfLabels: Number(rawBox.NoOfLabels),
		DateTimeCreated: rawBox.DateTimeCreated && new Date(rawBox.DateTimeCreated),
		BoxNumber: rawBox.BoxNumber.toString()
	};

	return box;
};

const prepareLabel = (rawLabel: Labels) => {
	const label = {
		...rawLabel,
		DateTimeInserted: new Date(),
		BoxNumber: rawLabel.BoxNumber?.toString(),
		CreatedDate: rawLabel.CreatedDate && new Date(rawLabel.CreatedDate)
	};

	return label;
};

const EXCEL_HEADER_TO_LABEL_COLUMNS = {
	'Record ID': 'LabelID',
	Model: 'ModelNumber',
	Version: 'VersionNumber',
	Temperature: 'LabelTemp',
	'Box number': 'BoxNumber',
	'Order number': 'OrderNumber',
	'Machine number': 'MachineNumber',
	'Ink volume': 'InkVolume',
	'Operator name': 'OperatorName',
	'Pillow ID': 'PillowID',
	'Ink ID': 'InkBatchNumber'
} as const;

const EXCEL_HEADER_TO_BOX_COLUMNS = {
	CustomerNumber: 'CustomerNumber',
	ModelNumber: 'LabelType',
	BoxNumber: 'BoxNumber',
	CreatedDate: 'DateTimeCreated',
	OperatorName: 'OperatorName'
} as const;

function parseDateString(dateString: string) {
	// Split the date and time components
	const [datePart, timePart] = dateString.split(' ');

	// Extract day, month, year components from the date
	const [day, month, year] = datePart.split('/').map(Number);

	// Extract hour, minute, second components from the time
	const [hour, minute, second] = timePart.split(':').map(Number);

	// Create a new Date object
	const parsedDate = new Date(year, month - 1, day, hour, minute, second);

	return parsedDate;
}

export const parseLabelRow = (row: Record<string, string>, shouldPrependZero = true) => {
	const newLabelItem = Object.entries(row).reduce(
		(acc, [key, value]) => {
			if (EXCEL_HEADER_TO_LABEL_COLUMNS[key]) {
				acc[EXCEL_HEADER_TO_LABEL_COLUMNS[key]] = value.toLocaleString();
			}

			return acc;
		},
		{
			CreatedDate: undefined,
			BoxNumber: undefined
		}
	);

	newLabelItem.CreatedDate = parseDateString(`${row.Date} ${row.Time}`);

	if (newLabelItem.CreatedDate.toString() === 'Invalid Date') {
		newLabelItem.CreatedDate = dayjs(`${row.Date} ${row.Time}`).toDate();
	}

	newLabelItem.BoxNumber = shouldPrependZero && newLabelItem.BoxNumber[0] !== '0' ? `0${newLabelItem.BoxNumber}` : newLabelItem.BoxNumber;
	return newLabelItem;
};

export const parseBoxRow = (lastRecord: Record<string, string>, amount: number, currentCustomer: string) => {
	const newBoxItem = Object.entries(lastRecord).reduce(
		(acc, [key, value]) => {
			if (EXCEL_HEADER_TO_BOX_COLUMNS[key]) {
				acc[EXCEL_HEADER_TO_BOX_COLUMNS[key]] = value;
			}

			return acc;
		},
		{
			// FirstLabelNo: firstRecord['Record ID'],
			// LastLabelNo: row['Record ID'],
			DateTimeCreated: undefined,
			CustomerNumber: '',
			NoOfLabels: 0
		}
	);

	// @ts-ignore
	newBoxItem.NoOfLabels = amount;
	newBoxItem.CustomerNumber = currentCustomer;
	return newBoxItem;
};

export const isBoxExists = async (boxNumber: string) => {
	const box = await prisma.boxes.findFirst({ where: { BoxNumber: boxNumber } });
	return !!box;
};

export const whichLabelsAlreadyExists = async (labels: Labels[]) => {
	const labelsNumbers = labels.map((label) => label.LabelID);
	const boxNumber = labels[0].BoxNumber;

	// Consider following with boxNumber later
	// const existingLabels = await prisma.labels.findMany({ where: { LabelID: { in: labelsNumbers }, BoxNumber: boxNumber } });
	const existingLabels = await prisma.labels.findMany({ where: { LabelID: { in: labelsNumbers } }, select: { LabelID: true } });

	return existingLabels;
};

export const insertBox = async (box: Boxes) => {
	const isBoxExist = await isBoxExists(box.BoxNumber);

	if (!isBoxExist) {
		return prisma.boxes.create({ data: box });
	}

	return false;
};

export const insertLabels = async (labels: Labels[]): Promise<Set<string>> => {
	const existingLabels = await whichLabelsAlreadyExists(labels);
	const existingLabelsSet = new Set(existingLabels.map((label) => label.LabelID));
	const newLabels = labels.filter((label) => !existingLabelsSet.has(label.LabelID));
	const insertedLabels = await prisma.labels.createMany({ data: newLabels.map(prepareLabel) });
	return existingLabelsSet;
};

/* Not available for SQL Server
export async function insertLabels(labels: Labels[]) {
	const duplicatedLabels = new Set<string>();

	try {
		await prisma.labels.createMany({
			data: labels.map(prepareLabel),
			skipDuplicates: true,
		});

	} catch (e) {
		console.error('Error inserting labels:', e);
		throw e;
	}

	return duplicatedLabels;
}*/
