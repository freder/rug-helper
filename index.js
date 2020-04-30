const localStorageKey = 'rug-pos-index';
const imgPath = 'rug_2020-04-27_lowres.png';
const img = new Image();
img.onload = () => main(img);
img.src = imgPath;


const getIndex = (x, y, width) => {
	return y * (width * 4) + x * 4;
};

const setColor = (i, pixels) => {
	pixels.data[i] = 255;
	pixels.data[i + 1] = 0;
	pixels.data[i + 2] = 0;
};

const makeCssColor = (r, g, b) => {
	return `rgb(${r}, ${g}, ${b})`;
};

const updateElem = (elem, total, used = 0) => {
	elem.innerText = `${total}: ${used}`;
};

function getCssColorAt(xx, yy, img, pixels) {
	const idx = getIndex(xx, yy, img.width);
	const r = pixels.data[idx];
	const g = pixels.data[idx + 1];
	const b = pixels.data[idx + 2];
	const color = makeCssColor(r, g, b);
	return color;
}

const incrementOrSetTo = (obj, key, val = 1) => {
	if (!obj[key]) {
		obj[key] = val;
	} else {
		obj[key]++;
	}
}


const histoData = {
	histo: {},
	histoUsed: {},
	elems: {},
};


const main = (img) => {
	const canvas = document.querySelector('canvas');
	const swatch = document.querySelector('#swatch');
	const container = document.querySelector('#container');

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
		const color = makeCssColor(r, g, b);
		swatch.style.background = color;

		const pixels = ctx.getImageData(0, 0, img.width, img.height);
		if (firstTime) {
			firstTime = false;
			let counter = 0;
			for (let xx = 0; xx < img.width; xx++) {
				for (let yy = 0; yy < img.height; yy++) {
					const color = getCssColorAt(xx, yy, img, pixels);
					incrementOrSetTo(histoData.histo, color, 1);
					if (counter <= i) {
						incrementOrSetTo(histoData.histoUsed, color, 1);
					}
					counter++;
				}
			}

			Object.keys(histoData.histo).forEach((color) => {
				const count = histoData.histo[color];
				const elem = document.createElement('div');
				histoData.elems[color] = elem;
				const fraction = count / (img.width * img.height);
				elem.style.width = `${fraction * 2.5 * 100}%`;
				elem.style.background = color;
				elem.style.color = 'white';
				elem.style.fontSize = '12px';
				elem.style.padding = '3px';
				container.appendChild(elem);
				updateElem(elem, count, histoData.histoUsed[color]);
			});
		} else {
			histoData.histoUsed = {};
			let counter = 0;
			for (let xx = 0; xx < img.width; xx++) {
				for (let yy = 0; yy < img.height; yy++) {
					const color = getCssColorAt(xx, yy, img, pixels);
					if (counter <= i) {
						incrementOrSetTo(histoData.histoUsed, color, 1);
					}
					counter++;
				}
			}
			Object.keys(histoData.histo).forEach((color) => {
				const elem = histoData.elems[color];
				const count = histoData.histo[color];
				const used = histoData.histoUsed[color];
				updateElem(elem, count, histoData.histoUsed[color]);
			});
		}

		for (let xx = 0; xx < x; xx++) {
			setColor(getIndex(xx, y, img.width), pixels);
		}
		for (let xx = x + 1; xx < img.width; xx++) {
			setColor(getIndex(xx, y, img.width), pixels);
		}
		for (let yy = /* y - 3 */ 0; yy < y; yy++) {
			setColor(getIndex(x, yy, img.width), pixels);
		}
		for (let yy = y + 1; yy < /* y + 4 */ img.height; yy++) {
			setColor(getIndex(x, yy, img.width), pixels);
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
	let firstTime = true;
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
