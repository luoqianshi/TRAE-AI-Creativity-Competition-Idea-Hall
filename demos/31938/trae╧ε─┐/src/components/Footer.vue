<template>
  <footer class="bg-gray-900 text-gray-300 py-8 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Building2 class="w-6 h-6 text-white" />
            </div>
            <span class="text-xl font-bold text-white">物业监管平台</span>
          </div>
          <p class="text-gray-400 text-sm leading-relaxed">
            物业监管平台致力于提升物业服务透明度，加强业主与物业之间的沟通，促进社区和谐发展。
          </p>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">快速链接</h4>
          <ul class="space-y-2">
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">关于我们</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">使用指南</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">常见问题</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">联系我们</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">联系方式</h4>
          <ul class="space-y-2">
            <li class="flex items-center space-x-2 text-gray-400 text-sm">
              <Phone class="w-4 h-4" />
              <span>400-888-8888</span>
            </li>
            <li class="flex items-center space-x-2 text-gray-400 text-sm">
              <Mail class="w-4 h-4" />
              <span>support@property.com</span>
            </li>
            <li class="flex items-center space-x-2 text-gray-400 text-sm">
              <Clock class="w-4 h-4" />
              <span>工作日 9:00-18:00</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
        <p>© 2024 物业监管平台 版权所有</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Building2, Phone, Mail, Clock } from 'lucide-vue-next'
</script>
