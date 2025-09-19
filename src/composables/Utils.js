import router from '@/routes/index.js'
import { createToaster } from "@meforma/vue-toaster";

const toaster = createToaster({
  position: 'bottom',
  duration: 4000
})

export const useGoTo = (path) => {
    router.push(path);
}


