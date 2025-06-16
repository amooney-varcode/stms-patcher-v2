import sql from 'mssql';
import { prisma } from '~/db.server';

const scansRef = prisma.scans;

const config = {
	user: 'stms-develop',
	password: 'QW3zP3fNERO0ttQ6GKt7',
	server: '3.121.250.121',
	database: 'DeltaGlobal',
	options: {
		trustServerCertificate: true // Change this based on your setup, for testing purposes
	}
};

export const getFailedScansHistory = () =>
	prisma.scanHistory.findMany({
		where: {
			barcodeImage: null
		},
		orderBy: {
			scanDate: 'desc'
		}
	});

export const getScanByCustomerId = (customerId: string, skip: number, take: number) => {
	console.time('getScanByCustomerId');

	const resit = scansRef.findMany({
		where: {
			CustomerNumber: customerId
		},
		take,
		skip,
		orderBy: {
			ScanDate: 'desc'
		}
	});

	console.timeEnd('getScanByCustomerId');
	return resit;
};
export const getScansHistory = async (customerId: string) => {
	try {
		console.time('Query time');
		// Create a SQL Server connection pool
		const pool = await sql.connect(config);

		const query = `
      SELECT ID, ScanDate
      ,ReaderID
      ,Barcode
      ,DeliveryNote
      ,CustomerNumber
      ,ProfileID
      ,QualityCodeNo
      ,Upc
      ,ReadingLocation
      ,IsUnique
      ,Latitude
      ,Longitude
      ,Del
      ,ScanRespones
      ,LangCode
      ,SiteID
      ,AutoScannedSon
      ,Feedback
      ,InheritedDeliveryNote
      ,InheritedUpc
      FROM scans
      WHERE CustomerNumber = @CustomerNumber
      ORDER BY ScanDate`;

		const queryResult = await pool.request().input('CustomerNumber', sql.VarChar(20), customerId).query(query);

		// Print the retrieved data

		console.timeEnd('Query time');
		// Close the connection pool
		await pool.close();

		return queryResult.recordset;
	} catch (error) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		console.error('Error:', error?.message);
		return null;
	}
};

export const getScanHistoryByCustomerId = async (customerId: string, skip: string, take: string) => {
	try {
		console.time('Query time');
		// Create a SQL Server connection pool
		const pool = await sql.connect(config);

		const query = `
      SELECT ID, ScanDate
      ,ReaderID
      ,Barcode
      ,DeliveryNote
      ,CustomerNumber
      ,ProfileID
      ,QualityCodeNo
      ,Upc
      ,ReadingLocation
      ,IsUnique
      ,Latitude
      ,Longitude
      ,Del
      ,ScanRespones
      ,LangCode
      ,SiteID
      ,AutoScannedSon
      ,Feedback
      ,InheritedDeliveryNote
      ,InheritedUpc
      FROM scans
      WHERE CustomerNumber = @CustomerNumber
        AND ScanDate > @StartDate
        AND ScanDate <= @EndDate
      ORDER BY ScanDate`;

		const queryResult = await pool
			.request()
			.input('CustomerNumber', sql.VarChar(20), customerId)
			.input('StartDate', sql.DateTime, skip)
			.input('EndDate', sql.DateTime, take)
			.query(query);

		// Print the retrieved data

		console.timeEnd('Query time');
		// Close the connection pool
		await pool.close();

		return queryResult.recordset;
	} catch (error) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		console.error('Error:', error?.message);
		return null;
	}
};
