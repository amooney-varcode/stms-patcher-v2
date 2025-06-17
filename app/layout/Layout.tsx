import React from 'react';
import { Link as RemixLink } from '@remix-run/react';
import { Button, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@nextui-org/react';

const Layout: React.FC<React.PropsWithChildren & { currentLocation: string }> = ({ children, currentLocation }) => (
	<>
		<Navbar shouldHideOnScroll>
			<NavbarBrand>
				<p className="font-bold text-inherit">Varcode</p>
			</NavbarBrand>
			<NavbarContent className="hidden gap-4 sm:flex" justify="center">
				<NavbarItem isActive={currentLocation === '/customers'}>
					<RemixLink to="/customers">Customers</RemixLink>
				</NavbarItem>
				<NavbarItem isActive={currentLocation === '/uploadExcel'}>
					<RemixLink to="/uploadExcel">Upload excel</RemixLink>
				</NavbarItem>
				<NavbarItem isActive={currentLocation === '/'}>
					<RemixLink to="/">Home</RemixLink>
				</NavbarItem>
				<NavbarItem isActive={currentLocation === '/failedScans'}>
					<RemixLink to="/failedScans">Failed Scans(take a moment to load)</RemixLink>
				</NavbarItem>
			</NavbarContent>
			<NavbarContent justify="end">
				<NavbarItem>
					<Button as={Link} color="primary" href="/logout" variant="flat">
						Log out
					</Button>
				</NavbarItem>
			</NavbarContent>
		</Navbar>
		<main>{children}</main>
	</>
);

export default Layout;
