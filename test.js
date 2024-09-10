import randomColor from 'randomcolor';

const hue = process.argv[2];
const luminosity = process.argv[3];

console.log(randomColor({ luminosity: luminosity, hue: hue }));
