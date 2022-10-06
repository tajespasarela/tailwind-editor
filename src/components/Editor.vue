<script setup>
  import { onMounted, reactive, watch } from 'vue';
  import colors from 'tailwindcss/colors';

  const editableColors = reactive(Object.entries(colors)
      .filter(([colorName]) => !['inherit', 'current', 'transparent', 'black', 'white'].includes(
          colorName))
      .reduce((resultColors, [colorName, colorValue]) => {
        resultColors[colorName] = colorValue;
        return resultColors;
      }, {}));

  async function getCss() {
    getStyleElement().innerHTML = await fetch('http://localhost:8080', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        html: document.body.innerHTML,
        theme: {
          extend: { colors: editableColors }
        }
      })
    }).then(response => response.text());
  }

  function getStyleElement() {
    let styleElement = document.getElementById('css');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'css';
      document.head.append(styleElement);
    }
    return styleElement;
  }

  onMounted(getCss);
  watch(editableColors, getCss);
</script>

<template>
<section style="display: flex; flex-flow: row wrap;">
  <div v-for="(color, colorName) in editableColors" style="display: flex; flex-flow: column nowrap;">
    <label v-for="(_, shadeName) in color">{{ colorName }} {{ shadeName }}
      <input type="color" v-model.lazy="color[shadeName]">
    </label>
  </div>
</section>

</template>

<style scoped>
</style>
