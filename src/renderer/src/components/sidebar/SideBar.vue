<template>
  <aside class="sidebar-container">
    <ReturnButtom />
  </aside>
</template>

<script setup lang="ts">
import ReturnButtom from './ReturnButtom.vue'

</script>

<style scoped>
.sidebar-container {
  height: 100%;
  width: 160px;
  padding-left: 30px;
  padding-bottom: 140px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border-radius: 20px;
  box-sizing: border-box;
}
</style>