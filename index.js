// import libraries

import { argv } from 'node:process';
import chalk from 'chalk';
import randomColor from 'randomcolor';

// functions

// save user input
const hue = argv[2];
const luminosity = argv[3];

// generate random hex based on user input
const outputColor = randomColor({ luminosity: luminosity, hue: hue });

// create a chalk
const generatedColorChalk = chalk.hex(outputColor);

// generate text template with random emoji

const outputTemplate = `###############################
###############################
###############################
#####                     #####
#####      ${outputColor}        #####
#####                     #####
###############################
###############################
###############################`;

// log generated message
console.log(generatedColorChalk(outputTemplate));
