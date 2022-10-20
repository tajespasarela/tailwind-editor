# Tailwind + Vue No-code editor

There has been much talk about no-code lately. This movement tries to approach software development to non-developers, offering tools that allow them to create and modify applications without using code. The benefits of no-code tools include speed, accessibility, reduced costs and autonomy.

Thinking about this idea, I wondered how to create a no-code editor for a web application. But, since a tool like this would be huge for a single post, I decided to focus only on the personalization of the styles and themes.

For that, I decided to rely on one of the most popular CSS frameworks at the moment: Tailwindcss. Not because of its usual use, but for all the tools it has in terms of configuration and CSS generation.

The idea is to create a frontend interface which allows to modify the [Tailwindcss configuration](https://tailwindcss.com/docs/configuration) on live and shows the result styles applied. Then, this customized configuration could be stored and used in the build and deployment process of a hypothetical application.

![Architecture](images/architecture.png)

But in this article, we are going to focus only on the editor part and how to preview on live the Tailwindcss config changes.

![Architecture Detail](images/architecture-detail.png)

To achieve that we are going to create a simple service in Node using [ExpressJs](https://expressjs.com/). This service will receive the Tailwindcss configuration from the frontend editor and run [Postcss](https://postcss.org/) with the Tailwindcss plugin to generate the CSS. Finally, the service will return the generated CSS to the editor, which will update the page to show the changes.

> We could try to run the postcss and tailwind plugin directly in the browser, making it to work with node polyfills, using tailwind internals implementations like they do in [play.tailwindcss.com](https://play.tailwindcss.com/), or using the brand new [Web Containers](https://blog.stackblitz.com/posts/introducing-webcontainers/) but for simplicity's sake, we do it in a simple node service.
>

## Creating the project

Let’s create the new project called `tailwind-editor` with [Vite](https://vitejs.dev/) running `npm create`. I’m going to use [Vue](https://vuejs.org/) for the Frontend because I’m more comfortable with it and also because it is Awesome ;)

```bash
$ dev npm create vite@latest
✔ Project name: … tailwind-editor
✔ Select a framework: › Vue
✔ Select a variant: › JavaScript
```

Then, we add the dependencies for the service.

```bash
$ cd tailwind-editor
$ npm install --save express cors postcss tailwindcss
```

The resulting package:

```json
{
  "name": "tailwind-editor",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.1",
    "postcss": "^8.4.17",
    "tailwindcss": "^3.1.8",
    "vue": "^3.2.37"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^3.1.0",
    "vite": "^3.1.0"
  }
}
```

## Creating the Tailwindcss service

Now, we are going to create the service that will receive the Tailwindcss config and return the CSS. Let’s start with a file `src/tailwind-as-a-service.js` which will contain the [ExpressJs](https://expressjs.com/) server with the `cors` middleware to support [cross-origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) calls. It is listening by port 8080 to any request to the root path with a `GET` method and returns a text with `Hello World`.

```jsx
// src/tailwind-as-a-service.js

import express from 'express';
import cors from 'cors';

const app = express()
app.use(cors());
const port = 8080

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Tailwind as a service listening on port ${port}`)
})
```

Running the server with node we have the response directly in the browser:

```bash
$ node ./src/tailwind-as-a-service.js
```

![Hello World](images/hello-world.png)

> We are using Node 16, which supports [ES modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) by default. If you are using older versions of Node you can use CommonJs modules and just rename the file with the `.cjs` extension.
>

So far, so good. Now we are going to configure `postcss` and its tailwind plugin to return CSS:

```jsx
// src/tailwind-as-a-service.js
......
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

......

const defaultCss = `
  @import 'tailwindcss/base';
  @import 'tailwindcss/components';
  @import 'tailwindcss/utilities';
`;

app.get('/', async (req, res) => {
  const configuredTailwind = tailwindcss({
    content: [{ raw: '<div class="bg-red-500">', extension: 'html' }]
  });
  const postcssProcessor = postcss([configuredTailwind]);
  const { css } = await postcssProcessor.process(defaultCss);
  res.send(css);
});

......
```

We added the `postcss` and `tailwindcss` dependencies. Then we configure the Tailwindcss plugin for postcss with the [content](https://tailwindcss.com/docs/content-configuration) option.

This option tells Tailwindcss to inspect the HTML, JavaScript components and more files, to look for CSS classes to generate and include its CSS in the final result. It allows also us to put inline “raw” HTML.

After that, we create a `postcssProcessor` with the configured plugin of Tailwindcss. This is responsible for parsing the CSS and applying all postcss plugins.

Finally, we process a “fake” CSS file with the default base, components and utility styles of Tailwindcss. This is necessary to make Tailwindcss generate all necessary CSS.

The result CSS is returned in the response. So if we run again the service with `node ./src/tailwind-as-a-service.js` and we request from the browser, then we can see the resulting CSS:

![CSS response](images/css-response.png)

Here you can see the base CSS that [Tailwindcss brings by default](https://tailwindcss.com/docs/preflight) and also, at the end, the `.bg-red-500` class that we are passing as raw HTML to the Tailwindcss config.

So we have a service to request and return the CSS, but how do we configure that CSS? well let’s make this service receive parameters and use them to configure the Tailwindcss plugin:

```jsx
// src/tailwind-as-a-service.js

......
app.post('/', async (req, res) => {
  const configuredTailwind = tailwindcss({
    content: [{ raw: req.body.html, extension: 'html' }],
    theme: req.body.theme
  });
......
});
......
```

Here, we changed the `.get` method into `.post` to be able to send and receive parameters in the request body, for larger parameters.

Moreover, we pick `html` and `theme` parameters from the request body and use them to [configure Tailwindcss](https://tailwindcss.com/docs/configuration).

> For simplicity, we are using only the `theme` part of the Tailwindcss configuration, but with this approach, we can configure any part of the [Tailwindcss configuration](https://tailwindcss.com/docs/configuration).
>

## Creating Editor

We are going to define some custom configuration for Tailwindcss Theme, which we will allow to modify by the user using an interface. We define here some values for a little example of components: buttons and titles. To keep small scope for this example we only allow to change of some colours and font properties:

```jsx
// src/custom-tailwind-config.js

export const customTailwindConfig = {
  colors: {
    primary: {
      25: '#cdd3d6',
      50: '#243d48',
      75: '#1b2d36'
    },
    secondary: {
      25: '#bfe1ec',
      50: '#0086b2',
      75: '#006485'
    },
    success: {
      25: '#ecfdf5',
      50: '#10b981',
      75: '#065f46'
    },
    warning: {
      25: '#fffbeb',
      50: '#f59e0b',
      75: '#92400e'
    },
    error: {
      25: '#fef2f2',
      50: '#ef4444',
      75: '#991b1b'
    },
    title: {
      1: '#000',
      2: '#a3a3a3',
      3: '#000',
      4: '#0e7490'
    }
  },
  fontSize: {
    button: '1rem',
    'size-title1': '2rem',
    'size-title2': '1.5rem',
    'size-title3': '1.25rem',
    'size-title4': '1.125rem'
  },
  fontWeight: {
    'weight-button': '400',
    'weight-title1': '700',
    'weight-title2': '700',
    'weight-title3': '400',
    'weight-title4': '400'
  }
};
```

> Keep in mind that we are using the Tailwind Theme configuration for simplicity’s sake and it is not the only way to achieve the same result. The whole Tailwindcss configuration could be overridden, included the [plugins](https://tailwindcss.com/docs/plugins) used or de configuration of these plugins. You could think about to create your own Tailwindcss plugin, for example, which could add all your CSS components based on a configuration passed to the plugin. This configuration could be passed as parameter to the Tailwindcss service as we are doing here with the Theme configuration.
>

Now, we go to the `App.vue` component and remove all default content, adding some buttons and titles using the CSS utility classes which Tailwindcss generates with the previous Theme configuration:

```html
// src/App.vue

<template>
		<section class="flex flex-col gap-10 min-w-[200px] m-10">
		      <section class="flex flex-col gap-10">
		        <button class="w-40 h-8 rounded bg-primary-50 hover:bg-primary-75 text-primary-25 hover:text-primary-25 text-button font-weight-button">
		          Button Primary
		        </button>
		        <button class="w-40 h-8 rounded bg-secondary-50 hover:bg-secondary-75 text-secondary-25 hover:text-secondary-25 text-button font-weight-button">
		          Button Secondary
		        </button>
		        <button class="w-40 h-8 rounded bg-success-50 hover:bg-success-75 text-success-25 hover:text-success-25 text-button font-weight-button">
		          Button Success
		        </button>
		        <button class="w-40 h-8 rounded bg-warning-50 hover:bg-warning-75 text-warning-25 hover:text-warning-25 text-button font-weight-button">
		          Button Warning
		        </button>
		        <button class="w-40 h-8 rounded bg-error-50 hover:bg-error-75 text-error-25 hover:text-error-25 text-button font-weight-button">
		          Button Error
		        </button>
		      </section>
		
		      <section class="flex flex-col gap-10 m-10">
		        <h1 class="text-title-1 text-size-title1 font-weight-title1">
		          Title 1
		        </h1>
		        <h2 class="text-title-2 text-size-title2 font-weight-title2">
		          Tittle 2
		        </h2>
		        <h3 class="text-title-3 text-size-title3 font-weight-title3">
		          Tittle 3
		        </h3>
		        <h4 class="text-title-4 text-size-title4 font-weight-title4">
		          Tittle 4
		        </h4>
		      </section>
		    </section>
		</section>
</template>
```

Before of running the `dev` script for running the Vue project, we modify this script in the `package.json` file to run at the same time the tailwind service:

```json
"dev": "node ./src/tailwind-as-a-service.js & vite",
```

Then we run the project and go to the local URL:

```bash
$ npm run dev
```

In the [latest version of Vite](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md) we are using, the default port is `5153`:

![Running Vite](images/running-vite.png)

And finally, we open that URL in the browser and… Ups! no styles?! what’s going on??

![First try](images/first-try.png)

This is because we are not using Tailwindcss directly in our Vue project as we usually do. Instead, we need to call our `tailwind-as-a-service` endpoint to retrieve the CSS. Ok then, let’s create the function to call the service.

We create a new file `fetch-css.js` in the `src` directory:

```jsx
// src/fetch-css.js

export async functionfetchCss(tailwindCustomConfig) {
return awaitfetch('http://localhost:8080', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      html: document.body.innerHTML,
      theme: {
        extend: tailwindCustomConfig
      }
    })
  }).then(response => response.text());
}

```

This `async` function is receiving the custom tailwind config and fetching the tailwind service passing it as `theme:{ extend: tailwindCustomConfig }` parameter. We pass it inside `extend`to [keep all the default utilities as Tailwind has](https://tailwindcss.com/docs/theme#extending-the-default-theme), and we only add the new ones we need. We also obtain all the current HTML on the page and send it to the service as `html` parameter. Tailwindcss will use this HTML to know which CSS classes generate and which don't.

Following, we create a new component `Editor.vue` to use that function:

```html
// src/components/Editor.vue

<script setup>
  import { onMounted, ref } from 'vue';
  import { customTailwindConfig } from '../custom-tailwind-config.js';
  import { fetchCss } from '../fetch-css.js';

  const css = ref('');

  async function getCss() {
    css.value = await fetchCss(customTailwindConfig);
  }

  onMounted(getCss);
</script>

<template>
  <component is="style">{{ css }}</component>
</template>
```

There are many things going on here:

- We import the previous `customTailwindConfig` and the `fetchCss` function.
- We add a `css` ref. If you are not familiar with the new Composition API of vue you can take a look at its [documentation](https://vuejs.org/api/composition-api-setup.html#basic-usage).
- We create a new function `getCss` which calls the `fetchCss` and assigns the returned promise value to the `ref` value.
- We use the `onMounted` [Vue lifecycle hook](https://vuejs.org/api/composition-api-lifecycle.html#onmounted) to call the previous function whenever the component is mounted.
- Finally, we create a [dynamic component](https://vuejs.org/guide/essentials/component-basics.html#dynamic-components) to attach the CSS to the DOM. This dynamic component will render the CSS inside a `<style>` tag, when the `css` ref is updated. This way whenever we update the `css` ref value, the styles will be updated.

> We use a dynamic component as a workaround because the `<style>` tag is not allowed inside `<template>` tag by Vue template compiler.
>

Now, we import and use the `Editor.vue` component inside the `App.vue`:

```html
// src/App.vue

<template>

  <div class="flex flex-row">
		......

    <Editor/>
  </div>
</template>

<script setup>
  import Editor from './components/Editor.vue';
</script>
```

If we reload again the URL then we do see the styles:

![Second Try](images/second-try.png)

Finally, the last step is to make the `Editor.vue` modify the default Theme from the Tailwindcss configuration and request again the CSS from the service to see a live view of the changes.

We are starting with the colours, adding a colour picker for each colour we want to configure.

```html
// src/components/Editor.vue
<script setup>
	......

  const css = ref('');
  const editableCustomConfig = reactive(customTailwindConfig);

  async function getCss() {
    css.value = await fetchCss(editableCustomConfig);
  }

  onMounted(getCss);
  watch(editableCustomConfig, getCss);

</script>

<template>

  <div class="flex flex-col flex-nowrap gap-10 w-1/2  m-10">

    <h2 class="font-bold">Colors</h2>
    <section class="flex flex-row flex-wrap gap-10">

      <div v-for="(color, colorName) in editableCustomConfig.colors"
           style="display: flex; flex-flow: column nowrap;">
        <label v-for="(_, shadeName) in color">{{ colorName }} {{ shadeName }}
          <input type="color" v-model.lazy="color[shadeName]">
        </label>
      </div>

    </section>
  </div>

  <component is="style">{{ css }}</component>
</template>
```

In this step, we are doing several changes to be able to modify reactively the configuration:

- In the `<script>`:
  - First, we create a [reactive object](https://vuejs.org/api/reactivity-core.html#reactive) with our `customTailwindConfig` as the initial value.
  - Then we fetch the CSS with this reactive object.
  - Finally, we add a [`watch`](https://vuejs.org/guide/essentials/watchers.html) to call `getCss` function, whenever this reactive object changes
- In the `<template>`:
  - We add two loops [`v-for`](https://vuejs.org/api/built-in-directives.html#v-for) to iterate over each colour and each shade, binding a colour picker to the value.
  - We use the [`v-model`](https://vuejs.org/api/built-in-directives.html#v-model) directive with the [`lazy`](https://vuejs.org/guide/essentials/forms.html#lazy) modifier to not request too many times whenever we move the selector on the colour picker.

  > Notice we are binding the colour shade to the `v-model` using the colour and the shade name, instead of using the `v-for` variable directly. This is because the variable used to iterate in the `v-for` loops is not allowed to be modified. So the workaround is to access the value indirectly.
  >

  Then if we run again the application we can see the colour pickers and changing a color the component using that colour will be updated automatically:

  ![Colour Editor](images/color-editor.png)


Finally, we add also the part of the font size and font weight:

```html
// src/components/Editor.vue
<script setup>
......
</script>

<template>
......

    <h2 class="font-bold">Font Sizes</h2>
    <section class="flex flex-row flex-wrap gap-10">
      <label v-for="(_, sizeName) in editableCustomConfig.fontSize">{{
          sizeName.replace('size-', '')
        }}
        <input type="number"
               step="0.125"
               class="w-14 border border-black text-center"
               :value="editableCustomConfig.fontSize[sizeName].replace('rem','')"
               @input="event=> editableCustomConfig.fontSize[sizeName] = event.target.value + 'rem'">rem
      </label>
    </section>

    <h2 class="font-bold">Font Weight</h2>
    <section class="flex flex-row flex-wrap gap-10">
      <label v-for="(_, weightName) in editableCustomConfig.fontWeight">{{
          weightName.replace('weight-', '')
        }}
        <input type="number"
               step="100"
               min="100"
               max="900"
               class="w-14 border border-black text-center"
               v-model="editableCustomConfig.fontWeight[weightName]">
      </label>
    </section>
  </div>

  <component is="style">{{ css }}</component>
</template>
```

Here we are repeating the same principle as with the colours, but with a single `v-for` for each case. Moreover, for the case of font size, we have to deal with the `rem` unit, adding and removing it, as it is necessary to pass it to the Tailwindcss configuration.

And here is the final aspect of the editor:

![Full Editor](images/full-editor.png)

So this is the starting point to create your own no-code tool, to configure your project and see the changes on the fly. Remind that using the Theme values is not the only way to make this configurable, and you can use all the Tailwindcss config options.
You can find all the working code [here](https://github.com/tajespasarela/tailwind-editor) fell free to open issues or leave comments and stars 😉.

## Why not CSS custom properties AKA CSS variables?

We could achieve exactly the same by using CSS variables as values in the Tailwindcss Theme configuration, and just modifying the value of these variables in the front, without the need for any service neither Tailwindcss process on the fly.

Then after saving these variables and loading them in production will have deployed the changes.

![Why](images/why.gif)

Well, in this example we are only modifying the Theme part of the Tailwindcss configuration, but there are [plenty more options](https://tailwindcss.com/docs/configuration) in that configuration.

Imagine you created a [Tailwindcss plugin](https://tailwindcss.com/docs/plugins) which adds your own Design Components and CSS utilities. These plugins can [have options](https://tailwindcss.com/docs/plugins#exposing-options) too.

So, with the exposed solution you can modify all these possible configurations and options and see the result directly on the fly.

Also, you can use the created service to directly save the configuration on your database, by user or customer to later retrieve it during the deployment process or for any other purpose you need.
