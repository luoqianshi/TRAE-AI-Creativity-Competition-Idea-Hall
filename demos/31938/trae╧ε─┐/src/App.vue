<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar :activeTab="currentTab" @tab-change="handleTabChange" />
    <main class="flex-1">
      <transition name="fade" mode="out-in">
        <Home v-if="currentTab === 'home'" @navigate="handleNavigate" />
        <Finance v-else-if="currentTab === 'finance'" />
        <Complaint v-else-if="currentTab === 'complaint'" />
        <Service v-else-if="currentTab === 'service'" />
        <Dashboard v-else-if="currentTab === 'dashboard'" />
      </transition>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import Home from './views/Home.vue'
import Finance from './views/Finance.vue'
import Complaint from './views/Complaint.vue'
import Service from './views/Service.vue'
import Dashboard from './views/Dashboard.vue'

const currentTab = ref('home')

const handleTabChange = (tab) => {
  currentTab.value = tab
}

const handleNavigate = (tab) => {
  currentTab.value = tab
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
