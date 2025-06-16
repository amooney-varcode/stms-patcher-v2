import { Button, Input } from '@nextui-org/react';
import React from 'react';
import ScansTable from '~/components/Tables/ScansTable';
import { undefinedGuard } from '~/utils/common';

const customers = () => {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [custmerId, setCustomerId] = React.useState<string>('999');

	const onClick = () => {
		const test = inputRef.current?.value?.length;

		if (!undefinedGuard(test)) return alert("Customer Number can't be empty");

		if (test < 2) return alert("Customer Number length can't be lower than 1");

		return setCustomerId(inputRef.current?.value ?? '999');
	};

	return (
		<div>
			<div className="flex content-center items-center my-2">
				<Input placeholder="Customer Number" ref={inputRef} color="primary" className="max-w-[220px]" />
				<Button color="success" className="mx-4" onClick={onClick}>
					Find!
				</Button>
				<label>Getting the data can take up to a full minute ! please wait until the query is done and don't refresh. </label>
			</div>
			<ScansTable customerId={custmerId} />
		</div>
	);
};

export default customers;
