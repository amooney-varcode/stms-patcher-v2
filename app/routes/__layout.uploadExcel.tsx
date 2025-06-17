import { Button, Checkbox, Progress } from '@nextui-org/react';
import { useFetcher } from '@remix-run/react';
import React, { FormEvent, useEffect, useState } from 'react';
import { ClientOnly } from 'remix-utils';
import Papa from 'papaparse';
import { parseBoxRow, parseLabelRow } from '~/services/uploadExcel.service';
import { downloadCSV, isFieldVInvlidInExcel } from '~/utils/common';

let resultsBatched: any[] = [];

const __LayoutUploadExcel = () => {
	const fetcher = useFetcher<{ message: any; alreadyExistLbaelsInBox?: Array<{ [key: string]: any }> }>();
	const [progress, setProgress] = React.useState<number>(0);
	const [shouldPrependZero, setShouldPrependZero] = useState(false);
	const [shouldValidateBoxSize, setShouldValidateBoxSize] = useState(false);

	React.useEffect(() => {
		if (fetcher.state === 'idle') return setProgress(0);

		const amountToAdd = 100 / ((resultsBatched.length + 1) * 0.653);

		const interval = setInterval(() => {
			setProgress((prev) => prev + amountToAdd);
		}, 1000);

		return () => {
			clearInterval(interval);
			resultsBatched = [];
		};
	}, [fetcher.state]);

	useEffect(() => {
		if (fetcher.data?.message === 'warn') {
			setProgress(0);
			alert(
				`ERROR: firstLabel: ${fetcher.data.alreadyExistLbaelsInBox[0]?.duplicatedLabels?.[0].labelId} is already in STMS. 
				\nSome of the data was not uploaded, please check the excel file and try again! downloading failed labels and boxes...`
			);
			downloadCSV(fetcher.data.alreadyExistLbaelsInBox, 'alreadyExistLbaelsInBoxLabels');
		}
	}, [fetcher.data]);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const excelFile = formData.get('excelFile');
		let currentBatch: any = [];
		let currentCustomer = '';

		if (excelFile) {
			Papa.parse(excelFile as Blob, {
				header: true,
				skipEmptyLines: true,
				dynamicTyping: false,
				step: (row) => {
					if (row.data.Index === 'Index' || row.data.Index === '*' || row.data.Index === '' || row.data.Index === ' ') {
						if (currentBatch.length > 0) {
							resultsBatched.push({
								labels: currentBatch,
								box: parseBoxRow(currentBatch[currentBatch.length - 1], currentBatch.length, currentCustomer)
							});
						}

						if (shouldValidateBoxSize && currentBatch.length < 99) {
							alert(`ERROR: box number: ${currentBatch[currentBatch.length - 1].BoxNumber} has less than 100 labels! \n nothing was uploaded!`);
							throw new Error('Invalid box size in excel file!');
						}

						currentBatch = [];
					} else {
						const invalidField = isFieldVInvlidInExcel(row.data);

						if (invalidField) {
							alert(
								`ERROR: "${invalidField} - is empty" in excel file! row -- recordId: ${row.data['Record ID'] ?? 'empty'} boxNumber: ${row.data['Box number'] ?? 'empty'
								}, \n nothing was uploaded!`
							);

							throw new Error('Invalid field in excel file!');
						}

						currentCustomer = row.data['Customer ID'] ?? currentCustomer;
						currentBatch.push(parseLabelRow(row.data, shouldPrependZero));
					}
				},
				complete: async () => {
					if (currentBatch.length > 0) {
						resultsBatched.push({
							labels: currentBatch,
							box: parseBoxRow(currentBatch[currentBatch.length - 1], currentBatch.length, currentCustomer)
						});
					}

					if (resultsBatched.length === 0 || resultsBatched[0].labels.length === 0) return alert('No data found in excel file!');

					fetcher.submit(
						{ labelsBoxes: JSON.stringify(resultsBatched), type: 'labels+box' },
						{
							method: 'post',
							action: '/api/upload'
						}
					);
				}
			});
		}
	};

	return (
		<div className="flex w-screen place-content-center place-items-center h-96">
			<ClientOnly fallback="loading...">
				{() => (
					<form onSubmit={onSubmit} className="flex flex-col gap-4">
						<h1>Upload excel for labels - boxes system only!</h1>
						<Checkbox isSelected={shouldPrependZero} onValueChange={setShouldPrependZero}>
							Should Prepend 0 to box number? ( doesn't effect box numbers with zero already prepended )
						</Checkbox>
						<Checkbox isSelected={shouldValidateBoxSize} onValueChange={setShouldValidateBoxSize}>
							Should should validate box size? (have at least 100 labels in each box)
						</Checkbox>
						<input type="file" name="excelFile" accept=".csv" />
						<Button className="w-24" color="success" type="submit">
							Upload excel
						</Button>
						{progress !== 0 && <Progress label={progress < 100 ? 'Loading...' : 'Couple of more seconds...'} value={progress} className="w-96" />}
						{fetcher.data
							&& (fetcher.data?.message === 'ok' ? (
								<h1>Successfully uploaded!</h1>
							) : fetcher.data?.message === 'warn' ? (
								<h1>
									Partial labels and boxes were uploaded, check alreadyExistLbaelsInBoxLabels.csv to see what failed (already downloaded to
									you).
								</h1>
							) : (
								<h1>upload Failed! nothing was uploaded</h1>
							))}
					</form>
				)}
			</ClientOnly>
		</div>
	);
};

export default __LayoutUploadExcel;
