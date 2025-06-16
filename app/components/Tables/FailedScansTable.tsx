import { Modal, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/modal';
import { Button, useDisclosure } from '@nextui-org/react';
import { ICellRendererParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React from 'react';
import { ClientOnly } from 'remix-utils';
import ImageOfFailedImageModal from '~/components/Modals/ImageOfFailedImageModal';
import { _arrayBufferToBase64 } from '~/utils/common';

interface Props {
	data: any[];
}

const defaultColumns = [
	{
		field: 'userUUID',
		headerName: 'user UUID'
	},
	{
		field: 'barcodeImageURL',
		headerName: 'Barcode Image Preview',
		cellRenderer: (props: ICellRendererParams) => {
			const { isOpen, onOpen, onOpenChange } = useDisclosure();

			return (
				<div>
					<Button onClick={onOpen}>Show Image</Button>
					<ImageOfFailedImageModal isOpen={isOpen} onOpenChange={onOpenChange} s3ImageKey={props.value} />
				</div>
			);
		}
	},
	{
		field: 'scanDate',
		headerName: 'Scan Date',
		cellRenderer: (props: ICellRendererParams) => {
			const test = new Date(`${props.value}`).toLocaleString();
			return `${test}`;
		}
	}
];

const FailedScansTable = ({ data }: Props) => {
	const defaultColDef = {
		flex: 1,
		resizable: true,
		sortable: true,
		// height: '100vh',
		filter: true
	};

	return (
		<div className="ag-theme-alpine h-screen">
			<ClientOnly fallback="Loading...">
				{() => (
					<AgGridReact
						rowHeight={200}
						rowData={data} // use signal
						columnDefs={defaultColumns} // no signal
						rowSelection="single"
						enableCellTextSelection
						defaultColDef={defaultColDef}
					/>
				)}
			</ClientOnly>
		</div>
	);
};

export default FailedScansTable;
