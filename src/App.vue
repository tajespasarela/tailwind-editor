<template>

  <div class="flex flex-row">
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

    <Editor/>
  </div>
</template>

<script setup>
  import Editor from './components/Editor.vue';
</script>


<style scoped>

</style>
