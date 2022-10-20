<script setup>
  import { onMounted, reactive, ref, watch } from 'vue';
  import { customTailwindConfig } from '../custom-tailwind-config.js';
  import { fetchCss } from '../fetch-css.js';

  const editableCustomConfig = reactive(customTailwindConfig);
  const css = ref('');

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

  <component class="w-1/2 p-10 block whitespace-pre-wrap visible bg-yellow-100 h-screen overflow-scroll" is="style">{{ css }}</component>
</template>

<style scoped>
</style>
