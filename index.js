const localStorageKey = 'rug-pos-index';
const imgPath = 'rug_2020-04-27_lowres.png';
const img = new Image();
img.onload = () => main(img);
img.src = imgPath;


const main = (img) => {
	const canvas = document.querySelector('canvas');
	const swatch = document.querySelector('#swatch');

	canvas.style.width = (img.width) + 'px';
	canvas.style.height = (img.height) + 'px';

	// const scale = window.devicePixelRatio;
	const scale = 1;
	canvas.width = img.width * scale;
	canvas.height = img.height * scale;

	const ctx = canvas.getContext('2d');

	const update = (i) => {
		ctx.drawImage(img, 0, 0);

		const x = i % img.width;
		const y = Math.floor(i / img.width);
		const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data;
		const color = `rgb(${r}, ${g}, ${b})`;
		swatch.style.background = color;

		const pixels = ctx.getImageData(0, 0, img.width, img.height);
		const getIndex = (x, y, width = img.width) => {
			return y * (width * 4) + x * 4;
		};
		const setColor = (i, pixels) => {
			pixels.data[i] = 255;
			pixels.data[i + 1] = 0;
			pixels.data[i + 2] = 0;
		}
		for (let xx = 0; xx < x; xx++) {
			setColor(getIndex(xx, y), pixels);
		}
		for (let xx = x + 1; xx < img.width; xx++) {
			setColor(getIndex(xx, y), pixels);
		}
		for (let yy = /* y - 3 */ 0; yy < y; yy++) {
			setColor(getIndex(x, yy), pixels);
		}
		for (let yy = y + 1; yy < /* y + 4 */ img.height; yy++) {
			setColor(getIndex(x, yy), pixels);
		}
		ctx.putImageData(pixels, 0, 0);

		localStorage.setItem(localStorageKey, i);

		// ctx.strokeStyle = '#ff0000';
		// ctx.beginPath();
		// ctx.moveTo(-1, y);
		// ctx.lineTo(x - 1, y);
		// ctx.moveTo(x + 1, y);
		// ctx.lineTo(img.width + 1, y);
		// ctx.stroke();
	};

	let i = parseInt(localStorage.getItem(localStorageKey) || 0);
	update(i);

	window.addEventListener('keydown', ({ key }) => {
		if (key === 'ArrowLeft') {
			i = Math.max(0, i - 1);
		}
		if (key === 'ArrowRight') {
			i += 1;
		}
		update(i);
	});
};