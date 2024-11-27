module.exports = {
	apps: [
		{
			name: "MongoCarbon",
			script: "npm",
			watch: false,
			args: "start",
			env: {
				PORT: 3000,
				NODE_ENV: "production",
			},
		},
	],
};
