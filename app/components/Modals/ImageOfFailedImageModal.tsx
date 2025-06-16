import { Modal, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/modal';
import { Button } from '@nextui-org/react';
import { Skeleton } from '@nextui-org/skeleton';
import React, { useEffect } from 'react';
import { _arrayBufferToBase64 } from '~/utils/common';

type Props = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	s3ImageKey: string;
};

const ImageOfFailedImageModal = ({ isOpen, onOpenChange, s3ImageKey }: Props) => {
	const [base64Image, setBase64Image] = React.useState<string>('');

	useEffect(() => {
		(async () => {
			try {
				if (!isOpen) {
					return;
				}

				fetch(`/api/s3/${s3ImageKey}`)
					.then((resp) => resp.json())
					.then((data) => {
						const base64ImageBuffer = data?.result;

						if (!base64ImageBuffer) {
							setBase64Image(() => '');
						} else {
							setBase64Image(() => base64ImageBuffer);
						}
					});
			} catch (e) {
				console.log(e);
			}
		})();
	}, [isOpen]);
	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} className="max-w-[900px]">
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">Image of fail barcode scan</ModalHeader>
						<Skeleton isLoaded={base64Image.length > 0} className="rounded-lg h-[900px]">
							<img className="" src={`data:image/jpeg;base64,${base64Image}`} alt="barcode" />
						</Skeleton>
						<ModalFooter>
							<Button color="danger" variant="light" onClick={onClose}>
								Close
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};

export default ImageOfFailedImageModal;
