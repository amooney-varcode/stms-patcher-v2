import { Outlet, useLocation } from '@remix-run/react';
import React from 'react';
import Layout from '~/layout/Layout';

const _Layout = () => {
	const location = useLocation();

	return (
		<Layout currentLocation={location.pathname}>
			<Outlet />
		</Layout>
	);
};

export default _Layout;
