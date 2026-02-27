<template>
  <div class="min-h-screen bg-white text-gray-800 font-sans overflow-x-hidden">
    
    <section class="relative w-full pt-20 pb-10 flex flex-col items-center">
      <div class="z-10 text-center px-4">
        <img src="/logo.png" alt="Logo" class="mx-auto mb-4" />
        <h1 class="text-3xl md:text-5xl font-bold mb-6"> </h1>
        
        <div class="flex flex-wrap justify-center gap-4">
          <button class="px-6 py-2 bg-[#FF6B6B] text-white rounded-full shadow-lg hover:scale-105 transition">按鈕1</button>
          <button class="px-6 py-2 bg-[#9B6BFF] text-white rounded-full shadow-lg hover:scale-105 transition">按鈕2</button>
          <button class="px-6 py-2 bg-[#FFB347] text-white rounded-full shadow-lg hover:scale-105 transition">按鈕3</button>
        </div>
      </div>
      
      <div class="mt-10">
        <img src="placeholder-character.png" alt="Character" class="max-w-full h-auto" />
      </div>
    </section>

    <section class="relative py-16 px-4">
      <div class="max-w-4xl mx-auto border-4 border-pink-200 p-8 rounded-[50px] bg-white/80 backdrop-blur-sm">
        </div>
    </section>

  </div>
</template>

<script>
export default {
  name: 'MainComponent'
}
// 這裡處理 JavaScript 邏輯
</script>

<style scoped>

</style>