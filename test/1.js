/(?<body>[\s\S]*?)(?=<\/\w+|<!--|<\w+|{{|\${)/.exec(`string<`);

console.log(
  "/(?<body>[sS]*?)(?=</w+|<!--|<w+|{{|${)/.exec(`string<`): ",
  /(?<body>[\s\S]*(?=<\/\w+|<!--|<\w+|{{|\${))/.exec(`string<!--`),
);
