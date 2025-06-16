import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import React from 'react';
import FailedScansTable from '~/components/Tables/FailedScansTable';
import { getFailedScansHistory } from '~/services/scans.service';

export const loader = async () => {
	const customerScans = await getFailedScansHistory();
	return json({ customerScans });
};

const __LayoutFailedScans = () => {
	const { customerScans } = useLoaderData<typeof loader>();

	return (
		<div>
			<FailedScansTable data={customerScans} />
		</div>
	);
};

export default __LayoutFailedScans;
