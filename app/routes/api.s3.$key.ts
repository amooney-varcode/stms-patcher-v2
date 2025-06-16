import { json, LoaderArgs } from '@remix-run/node';
// import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import AWS from 'aws-sdk';
import { undefinedGuard } from '~/utils/common';

const S3_BUCKET = process.env.S3_BUCKET;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

AWS.config.update({ region: 'eu-central-1' });
export async function loader({ params }: LoaderArgs) {
	console.log('params- got request', params);
	const objectKey = params.key;

	const s3 = new AWS.S3({
		accessKeyId: ACCESS_KEY,
		secretAccessKey: SECRET_KEY,
		region: 'eu-central-1'
	});

	const paramss = {
		Bucket: S3_BUCKET,
		Key: objectKey ?? ''
	};

	try {
		const data = await s3.getObject(paramss).promise();

		if (!undefinedGuard<AWS.S3.Body>(data?.Body)) {
			return json({ result: null });
		}

		const base64Image1 = data.Body.toString('base64');
		return json({ result: base64Image1 });
	} catch (e) {
		console.log(e);
	}
	return json({ result: null });
}
