import { Boxes, Labels } from '@prisma/client';
import { json } from '@remix-run/node';
import { ActionFunctionArgs } from '@remix-run/router';
import { insertBox, insertLabels, prepareBox } from '~/services/uploadExcel.service';

export const action = async ({ request }: ActionFunctionArgs) => {
	const data = await request.formData();
	const type = data.get('type');

	if (type === 'labels+box') {
		try {
			const rawLabelsBoxes = data.get('labelsBoxes');
			const labelsBoxes = JSON.parse(rawLabelsBoxes as string);
			const alreadyExistLbaelsInBox = [];

			for (const labelBox of labelsBoxes) {
				const { box, labels } = labelBox as { box: Boxes; labels: Labels[] };
				const preparedBox = prepareBox(box);

				// eslint-disable-next-line no-await-in-loop
				const isSuccess = await insertBox(preparedBox);
				// eslint-disable-next-line no-await-in-loop
				const duplicatedLabels = await insertLabels(labels);

				if (duplicatedLabels.size > 0) {
					alreadyExistLbaelsInBox.push({
						box: preparedBox,
						duplicatedLabels: Array.from(duplicatedLabels).map((labelId) => ({
							labelId
						}))
					});
				}
			}

			if (alreadyExistLbaelsInBox.length > 0) {
				return json({ message: 'warn', alreadyExistLbaelsInBox });
			}
		} catch (e) {
			return json({ message: 'error', e });
		}
	}

	return json({ message: 'ok' });
};
