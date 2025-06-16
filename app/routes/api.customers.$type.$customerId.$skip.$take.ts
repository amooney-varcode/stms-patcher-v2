import { json, LoaderArgs } from '@remix-run/node';
import { getScanByCustomerId, getScanHistoryByCustomerId, getScansHistory } from '~/services/scans.service';

export async function loader({ params, request }: LoaderArgs) {
	console.log('params- got request', request.headers.get('token'));

	if (!request.headers.get('token') && request.headers.get('token') !== '1234567890') {
		return json({ results: 'unauthrized' });
	}

	if (params.type === 'table') {
		const results = await getScanByCustomerId(params.customerId ?? '999', Number(params.skip) ?? 0, Number(params.take) ?? 500);
		return json({ results });
	}

	if (params.type === 'all') {
		const results = await getScansHistory(params.customerId ?? '999');
		return json({ results });
	}

	const results = await getScanHistoryByCustomerId(
		params.customerId ?? '999',
		params.skip ?? '2023-08-11T19:15:55.920',
		params.take ?? '2023-08-15T00:00:00.000'
	);

	return json({ results });
}
