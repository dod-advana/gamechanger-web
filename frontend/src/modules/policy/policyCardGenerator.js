const PolicyCardGenerator = function PolicyCardGenerator() {};
PolicyCardGenerator.prototype.generateCards = (data) => {
	console.log('Generating cards!');
	console.log(data);
};

export const generator = new PolicyCardGenerator();
