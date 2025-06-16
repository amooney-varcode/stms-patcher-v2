import { useEffect, useRef, useState } from 'react';

type Props = {
	isRunning: boolean;
};

const Stopwatch = ({ isRunning }: Props) => {
	const [currentTime, setCurrentTime] = useState(0);

	useEffect(() => {
		let timer: NodeJS.Timer;

		if (isRunning) {
			const startTime = Date.now();
			timer = setInterval(() => {
				setCurrentTime(Date.now() - startTime);
			}, 10);
		} else {
			// @ts-ignore
			clearInterval(timer);
		}

		return () => {
			clearInterval(timer);
		};
	}, [isRunning]);

	return (
		<div>
			<p className="font-bold">
				{(currentTime / 1000).toFixed(2)}
				seconds
			</p>
		</div>
	);
};

export default Stopwatch;
