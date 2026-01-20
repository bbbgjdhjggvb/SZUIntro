<template>
  <div v-if="isLoading" class="loading-screen">
    <div class="loader-content">
      <img :src="logo" class="loader-logo" alt="Loading..." />
      <div class="loader-text">{{ loadingText }} ({{ progress }}%)</div>
    </div>
  </div>
  <router-view v-else v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Import all critical assets
import Alum_BG from '@/assets/Alum_BG.png'
import BackIcon from '@/assets/BackIcon.png'
import College_Associa_BG from '@/assets/College_Associa_BG.png'
import Distribution_BG from '@/assets/Distribution_BG.png'
import HomeBG from '@/assets/HomeBG.png'
import Home_Association_BG from '@/assets/Home_Association_BG.png'
import Home_Distribution_BG from '@/assets/Home_Distribution_BG.png'
import Outstanding_BG from '@/assets/Outstanding_BG.png'
import ReturnBackLight from '@/assets/ReturnBackLight.png'
import SZUIcon from '@/assets/SZUIcon.png'
import SZUJJHLogo from '@/assets/SZUJJHLogo.png'
import SZULogo from '@/assets/SZULogo.png'
import logo from '@/assets/logo.png'

const isLoading = ref(true)
const progress = ref(0)
const loadingText = ref('正在加載资源...')

const imagesToPreload = [
  Alum_BG,
  BackIcon,
  College_Associa_BG,
  Distribution_BG,
  HomeBG,
  Home_Association_BG,
  Home_Distribution_BG,
  Outstanding_BG,
  ReturnBackLight,
  SZUIcon,
  SZUJJHLogo,
  SZULogo,
  logo
]

const preloadImages = async (imageUrls: string[]) => {
  let loadedCount = 0
  const total = imageUrls.length
  
  if (total === 0) return

  // Concurrency limit to avoid overwhelming the network/disk
  const CONCURRENCY_LIMIT = 10 
  const queue = [...imageUrls]
  
  const worker = async () => {
    while (queue.length > 0) {
      const url = queue.shift()
      if (!url) break
      
      await new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => {
          console.warn(`Failed to preload image: ${url}`)
          resolve() // Continue anyway
        }
        img.src = url
      })

      loadedCount++
      progress.value = Math.floor((loadedCount / total) * 100)
    }
  }

  const workers = Array(Math.min(CONCURRENCY_LIMIT, total)).fill(null).map(() => worker())
  await Promise.all(workers)
}

const fetchGalleryImages = async () => {
  if (!(window as any).fileReadApi) {
    console.warn('FileReadApi not found, skipping gallery preload')
    return []
  }

  const startYear = 1988
  const endYear = 2021
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
  
  loadingText.value = '正在获取图册列表...'
  
  const allImages: string[] = []
  
  // Can fetch parallelly
  const tasks = years.map(async (year) => {
    try {
      const yearDir = `/alumni_gallery/${year}`
      const items = await (window as any).fileReadApi.getImageFilesInDir(yearDir)
      if (items && Array.isArray(items)) {
        return items.map((item: any) => {
          let safePath = item.displayName.replace(/\\/g, '/')
          if(safePath.startsWith('/')) safePath = safePath.slice(1)
          return "local-image://" + safePath
        })
      }
    } catch (e) {
      console.error(`Failed to load gallery list for ${year}`, e)
    }
    return []
  })

  const results = await Promise.all(tasks)
  results.forEach(urls => allImages.push(...urls))
  
  return allImages
}

const fetchOutstandingImages = async () => {
  if (!(window as any).fileReadApi) return []
  try {
    const data = await (window as any).fileReadApi.readConfigFileAccorName("outstanding_alumni.json")
    if (data && data.outstanding_alumni) {
      return data.outstanding_alumni.map((item: any) => {
        if (item.image) {
           return 'local-image:/' + item.image
        }
        return ''
      }).filter((url: string) => url !== '')
    }
  } catch (e) {
    console.error('Failed to load outstanding alumni images', e)
  }
  return []
}

const fetchCollegeImages = async () => {
  if (!(window as any).fileReadApi) return []
  
  try {
    const data = await (window as any).fileReadApi.readConfigFileAccorName("college_association.json")
    if (data && data.college_associations) {
      // For colleges, the view fetches the first image in the directory
      const tasks = data.college_associations.map(async (college: any) => {
         if (college.images) {
            try {
              const images = await (window as any).fileReadApi.getFlatDirImages(college.images)
              if (images && images.length > 0) {
                 // Preload only the cover (first image) as that's what shown in list
                 return 'local-image://' + images[0]
              }
            } catch (e) {
               console.warn(`Failed to preload college images for ${college.name}`)
            }
         }
         return ''
      })
      
      const results = await Promise.all(tasks)
      return results.filter(url => url !== '')
    }
  } catch (e) {
    console.error('Failed to load college images', e)
  }
  return []
}

const fetchIndustryImages = async () => {
  if (!(window as any).fileReadApi) return []
  try {
    // Uses association_distribution.json
    const rawData = await (window as any).fileReadApi.readConfigFileAccorName('association_distribution.json')
    let list: any[] = []
    if (Array.isArray(rawData)) {
      list = rawData
    } else if (rawData && Array.isArray(rawData.association_distribution)) {
      list = rawData.association_distribution
    }

    const filteredList = list.filter((item: any) => item.type === 'industry')

    const tasks = filteredList.map(async (item: any) => {
      if (item.images) {
        try {
          const images = await (window as any).fileReadApi.getFlatDirImages(item.images)
          if (images && images.length > 0) {
            return 'local-image://' + images[0]
          }
        } catch (e) {
          console.warn(`Failed to preload industry images for ${item.name}`)
        }
      }
      return ''
    })

    const results = await Promise.all(tasks)
    return results.filter(url => url !== '')

  } catch (e) {
    console.error('Failed to load industry images', e)
  }
  return []
}


onMounted(async () => {
  try {
    const start = Date.now()
    
    loadingText.value = '正在分析資源列表...'

    // Parallel fetch of all dynamic resources
    const [galleryImages, outstandingImages, collegeImages, industryImages] = await Promise.all([
      fetchGalleryImages(),
      fetchOutstandingImages(),
      fetchCollegeImages(),
      fetchIndustryImages()
    ])

    const allImages = [
      ...imagesToPreload, 
      ...galleryImages,
      ...outstandingImages,
      ...collegeImages,
      ...industryImages
    ]
    
    console.log(`Preloading total: ${allImages.length} images`)
    console.log(`- Static: ${imagesToPreload.length}`)
    console.log(`- Gallery: ${galleryImages.length}`)
    console.log(`- Outstanding: ${outstandingImages.length}`)
    console.log(`- Colleges: ${collegeImages.length}`)
    console.log(`- Industry: ${industryImages.length}`)
    
    loadingText.value = `正在緩存 ${allImages.length} 张图片...`
    
    // 2. Preload everything
    await preloadImages(allImages)
    
    const elapsed = Date.now() - start
    if (elapsed < 500) {
      await new Promise(r => setTimeout(r, 500 - elapsed))
    }
  } catch (e) {
    console.error('Preloading error', e)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #ffffff; /* Or theme color */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loader-logo {
  width: 100px;
  height: auto;
  margin-bottom: 20px;
  animation: pulse 2s infinite ease-in-out;
}

.loader-text {
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

@keyframes pulse {
  0% { opacity: 0.6; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.6; transform: scale(0.95); }
}

/* Transition for the main content appearing */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>