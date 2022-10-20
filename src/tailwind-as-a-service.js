import express from 'express';
import cors from 'cors';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

const app = express();
app.use(express.json());
app.use(cors());
const port = 8080;
const defaultCss = `
  @import 'tailwindcss/base';
  @import 'tailwindcss/components';
  @import 'tailwindcss/utilities';
`;

app.post('/', async (req, res) => {
  const configuredTailwind = tailwindcss({
    content: [{ raw: req.body.html, extension: 'html' }],
    theme: req.body.theme
  });
  const postcssProcessor = postcss([configuredTailwind]);
  const { css } = await postcssProcessor.process(defaultCss);
  res.send(css);
});

app.listen(port, () => {
  console.log(`Tailwind as a service listening on port ${ port }`);
});
