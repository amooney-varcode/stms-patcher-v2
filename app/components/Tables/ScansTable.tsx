import { AgGridReact } from 'ag-grid-react';
import { useEffect, useRef, useState } from 'react';
import { ClientOnly } from 'remix-utils';
import Stopwatch from '~/components/StopWatch';

type Props = {
	customerId: string;
};

const defaultColumns = [
	{
		field: 'CustomerNumber',
		headerName: 'Customer Number'
	},
	{
		field: 'Barcode',
		headerName: 'Barcode'
	},
	{
		field: 'ScanDate',
		headerName: 'Scan Date'
	},
	{
		field: 'ReaderID',
		headerName: 'Reader Id'
	},
	{
		field: 'ProfileID',
		headerName: 'Profile ID'
	},
	{
		field: 'QualityCodeNo',
		headerName: 'Quality Code'
	},
	{
		field: 'ReadingLocation',
		headerName: 'Reading Location'
	},
	{
		field: 'ProfileID',
		headerName: 'Profile Id'
	},
	{
		field: 'IsUnique',
		headerName: 'Is Unique'
	},
	{
		field: 'ScanRespones',
		headerName: 'Scan Response'
	}
];

const ScansTable = ({ customerId }: Props) => {
	const [rowData, setRowData] = useState();
	const [isRunning, setIsRunning] = useState(false); // [1
	const gridRef = useRef(null);

	const defaultColDef = {
		flex: 1,
		resizable: true,
		sortable: true,
		filter: true
	};

	console.log(customerId);

	useEffect(() => {
		if (!gridRef.current) {
			return;
		}

		gridRef.current.api.showLoadingOverlay();

		setIsRunning(true);
		fetch(`/api/customers/table/${customerId}/${0}/${400}`)
			.then((resp) => resp.json())
			.then((scanDetailsResult) => {
				setRowData(scanDetailsResult.results);
				gridRef.current?.api.hideOverlay();
				setIsRunning(false);
			});
	}, [customerId]);

	return (
		<div className="ag-theme-alpine h-screen">
			<Stopwatch isRunning={isRunning} />
			<ClientOnly fallback="Loading...">
				{() => (
					<AgGridReact
						ref={gridRef}
						rowData={rowData}
						rowGroupPanelShow="always"
						pivotPanelShow="always"
						rowSelection="multiple"
						pagination
						enableCellTextSelection
						columnDefs={defaultColumns} // no signal
						defaultColDef={defaultColDef}
					/>
				)}
			</ClientOnly>
		</div>
	);
};

export default ScansTable;
