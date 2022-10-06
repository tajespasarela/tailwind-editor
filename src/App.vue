<script setup>
  import Editor from './components/Editor.vue';
</script>

<template>

  <section class="flex flex-col gap-10 m-10">
    <h1 class="text-3xl font-bold">THIS IS DONE WITHOUT CSS CUSTOM PROPERTIES</h1>
    <section class="flex flex-row gap-10 m-10">
      <button class="w-40 h-10 rounded bg-red-200 hover:bg-red-500 text-red-900 hover:text-red-100 text-base">
        Button 1
      </button>
      <button class="w-40 h-10 rounded bg-blue-200 hover:bg-blue-500 text-blue-900 hover:text-blue-100 text-base">
        Button 2
      </button>
      <button class="w-40 h-10 rounded bg-amber-200 hover:bg-amber-500 text-amber-900 hover:text-amber-100 text-base">
        Button 3
      </button>
      <button class="w-40 h-10 rounded bg-green-200 hover:bg-green-500 text-green-900 hover:text-green-100 text-base">
        Button 4
      </button>
    </section>

    <section class="flex flex-col gap-10 m-10">
      <h1 class="text-3xl font-bold">
        Title 1
      </h1>
      <h2 class="text-2xl text-neutral-400 font-bold">
        Tittle 2
      </h2>
      <h3 class="text-xl font-serif">
        Tittle 3
      </h3>
      <h4 class="text-lg font-mono text-cyan-700">
        Tittle 4
      </h4>
    </section>

    <Editor/>
  </section>

</template>

<style scoped>

</style>
