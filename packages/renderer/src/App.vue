<style scoped>
    /* we will explain what these classes do next! */
    .v-enter-active,
    .v-leave-active {
        transition: opacity 0.5s ease;
    }

    .v-enter-from,
    .v-leave-to {
        opacity: 0;
    }

    /* width */
    ::-webkit-scrollbar {
        width: 10px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
        box-shadow: inset 0 0 10px 10px darkgray;
        border: solid 4px transparent;
    }

    /* Handle */
    ::-webkit-scrollbar-thumb {
        box-shadow: inset 0 0 10px 10px #07a;
        border: solid 4px transparent;
    }

    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
        background: #00588b;
    }
</style>
<template>
    <div class="flex flex-col w-screen h-screen overflow-hidden bg-[#292e36]">

        <!-- Titlebar -->
        <div class="relative top-0 left-0 h-[34px] w-full bg-[#23272A] text-white/50" style="-webkit-app-region: drag">
            <div class="absolute left-3 flex gap-1.5 top-1/2 transform -translate-y-1/2" style="-webkit-app-region: no-drag;">
                <div @click="close" class="w-3 h-3 bg-red-500 rounded-full cursor-pointer hover:bg-red-600"></div>
                <div @click="minimize" class="w-3 h-3 bg-yellow-500 rounded-full cursor-pointer hover:bg-yellow-600"></div>
                <div @click="maximize" class="w-3 h-3 bg-green-500 rounded-full cursor-pointer hover:bg-green-600"></div>
            </div>
            <p class="text-sm absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">Atenead {{ version }}</p>
        </div>

        <!-- Content -->
        <div class="flex flex-col relative w-full h-full">

            <!-- Loader -->
            <Transition>
                <div class="absolute flex justify-center items-center top-0 left-0 w-full h-full z-[10] bg-black/40" v-if="showLoader">
                    <svg aria-hidden="true" class="w-20 h-20 mr-2 text-[#ced4da] animate-spin fill-[#07b]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                </div>
            </Transition>

            <!-- Login page -->
            <div class="w-full h-full flex items-center justify-center relative px-20" v-if="view == 0" @keyup.enter="loginRequest">
                <div class="flex justify-center items-center gap-5 p-10 mb-14">
                    <img
                        class="h-12"
                        draggable="false"
                        src="/images/logo.png"
                    />
                    <div class="h-48 bg-gray-500 w-[1px]" />
                    <div class="flex flex-col gap-2 text-white">
                        <input autofocus v-model="username" class="bg-transparent border-2 border-gray-500 p-2 rounded-md transition duration-300 focus:outline-none focus:border-[#07b] focus:border-2" type="text" placeholder="Username or email" />
                        <input v-model="password" class="bg-transparent border-2 border-gray-500 p-2 rounded-md transition duration-300 focus:outline-none focus:border-[#07b] focus:border-2" type="password" placeholder="Password" />
                        <button @click="loginRequest" class="rounded-md mt-4 bg-[#07b] hover:bg-[#00588b] transition p-2 text-white">Login</button>

                        <p class="text-xs text-[#6c757d] mt-2 self-start text-center">Your username and password are not stored anywhere, they are only sent to <strong>sso.upc.edu</strong> so as to validate your identity.</p>
                    </div>
                </div>

                <div @click="goGithub" class="flex gap-2 items-end justify-center absolute bottom-3 left-0 w-full text-center p-2 text-white text-sm opacity-60 hover:opacity-80 cursor-pointer">
                    <img
                        class="w-7"
                        src="/images/github-white.png"
                    />
                    <span>Atenead is open source and available in Github</span>
                </div>
            </div>

            <!-- vv Static content vv -->
            <!-- Username header -->
            <Transition v-if="view == 1 || view == 2 || view == 3">
                <div class="flex gap-3 items-center p-4 text-white/80">
                    <img class="rounded-full w-10" :src="avatar" />
                    <span>{{ name }}</span>
                </div>
            </Transition>

            <!-- Footer -->
            <Transition v-if="view == 1 || view == 2 || view == 3">
                <div class="absolute flex justify-center gap-3 bottom-3 w-full">
                    <img
                        class="w-32 opacity-30"
                        draggable="false"
                        src="/images/logo.png"
                    />
                    <div @click="goGithub" class="flex gap-1 items-end text-center text-white text-sm opacity-30 hover:opacity-50 cursor-pointer">
                        <img
                            class="w-7"
                            src="/images/github-white.png"
                        />
                        <span>Atenead is open source and available in Github</span>
                    </div>
                </div>
            </Transition>
            <!-- ^^ Static content ^^ -->

            <!--  My Courses page -->
            <div class="flex flex-col w-full px-4 pb-4 text-white/80" v-if="view == 1">
                <div class="flex flex-col gap-3 max-h-[65vh] overflow-y-auto">
                    <div
                        v-for="c in courses"
                        :key="c.id"
                        class="rounded-md border p-3 border-[#6c757d] cursor-pointer"
                        :class="[ c.selected ? 'bg-[#3b404a]': '' ]"
                        @click="() => { c.selected = !c.selected }"
                    >
                        <span>{{ c.name }}</span>
                    </div>
                </div>

                <div class="flex justify-center mt-2">
                    <button @click="download" v-if="getSelectedCourses.length > 0" class="p-2 rounded-md bg-[#07b] hover:bg-[#00588b]">
                        Download ({{ getSelectedCourses.length }} selected)
                    </button>
                    <span v-else>
                        Click on some!
                    </span>
                </div>
            </div>

            <!-- Confirm download -->
            <div class="flex flex-col w-full px-4 pb-4 text-white/80" v-if="view == 2">
                <div class="flex flex-col gap-3 max-h-[65vh] overflow-y-auto">
                    <div
                        v-for="c in getSelectedCourses"
                        :key="c.id"
                        class="flex flex-col justify-center items-center rounded-md border p-3 border-[#6c757d]"
                    >
                        <span>{{ c.name }}</span>
                        <div class="flex items-center gap-4 text-sm">
                            <div class="flex items-center gap-3">
                                <span>All files</span>
                                <input type="checkbox" checked />
                            </div>
                            <div class="flex items-center gap-3">
                                <span>Text files (.pdf, .txt) <small>(currently unsupported)</small></span>
                                <input type="checkbox" disabled />
                            </div>
                            <div class="flex items-center gap-3">
                                <span>Media files (.mp4, .wav) <small>(currently unsupported)</small></span>
                                <input type="checkbox" disabled />
                            </div>
                            <!-- <div class="flex items-center gap-3">
                                <span>Compress as .zip</span>
                                <input type="checkbox" />
                            </div> -->
                        </div>
                    </div>
                </div>

                <div class="flex justify-center mt-2 gap-3">
                    <button @click="() => view = 1" class="p-2 rounded-md bg-gray-700 hover:bg-gray-700/70">
                        Go back
                    </button>
                    <button @click="confirmDownload" class="p-2 rounded-md bg-[#07b] hover:bg-[#00588b]">
                        Confirm download
                    </button>
                </div>
            </div>
            
            <!-- Download progress -->
            <div class="flex flex-col gap-3 justify-center items-center w-full h-full px-10 mb-20 text-white/80" v-if="view == 3">
                <img width="350" src="https://i.pinimg.com/originals/e7/7a/1e/e77a1e25a95370f4f625c115f1622378.gif" />
                <div class="flex flex-col items-center w-full">
                    <span class="text-xl text-center">{{ downloadStatusText  }}</span>
                    <span>{{ downloadItemText  }}</span>
                </div>
                <LvProgressBar v-if="pbMode == 'indeterminate' || downloadTotalIndex > 0" class="w-1/2" color="#07b" :mode="pbMode" :value="getDownloadPercentage.toFixed(2)" />
                <span v-if="downloadTotalIndex > 0">Completed {{ downloadCompletedIndex  }} out of {{ downloadTotalIndex  }}...</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue"
import LvProgressBar from 'lightvue/progress-bar'

/**
 * 0 = Login
 * 1 = My Courses
 * 2 = Confirm download
 * 3 = Download progress
 */
const view = ref(0)
const showLoader = ref(false)
const version = ref("")

const username = ref("")
const password = ref("")

const name = ref("")
const avatar = ref("")

const onlyPdfs = ref(true)
const compressIntoZip = ref(false)

const downloadStatusText = ref("Loading...")
const downloadItemText = ref("")
const downloadCompletedIndex = ref(0)
const downloadTotalIndex = ref(0)
const pbMode = ref("indeterminate")

const courses = ref([
    {
        name: "Example",
        id: "1",
        url: "https://",
        selected: false
    }
])

const getSelectedCourses = computed(() => {
    return courses.value.filter(c => c.selected) || []
});

const getDownloadPercentage = computed(() => {
    return 100 * downloadCompletedIndex.value / downloadTotalIndex.value
})

const download = () => {
    view.value = 2
};

const confirmDownload = () => {
    const r = getSelectedCourses.value;
    bridge.download(JSON.stringify(r));
    view.value = 3
};

bridge.on('set-download-total-count', (count) => {
    downloadTotalIndex.value = count
})

bridge.on('increment-download-count', () => {
    downloadCompletedIndex.value++
})

bridge.on('set-pb-mode', mode => {
    pbMode.value = mode
})

bridge.on('set-status-text', txt => {
    downloadStatusText.value = txt
});

bridge.on('set-item-text', txt => {
    downloadItemText.value = txt
})

bridge.on('set-version', v => {
    version.value = v
});

bridge.on('view', v => {
    view.value = v
})

bridge.on('load', (coursesStr) => {
    courses.value = []
    const _courses = JSON.parse(coursesStr);

    for (const c of _courses) {
        courses.value.push({ ...c, selected: false })
    }

    view.value = 1
    showLoader.value = false
});

const loginRequest = () => {
    bridge.on('login-response', data => {
        console.log(data)
        if (data) {
            data = JSON.parse(data);

            if (data) {
                name.value = data.name
                username.value = data.username
                avatar.value = data.avatarUrl
            }

            bridge.load()
        }
        showLoader.value = false
    });

    bridge.login(username.value, password.value)
    password.value = ""
    showLoader.value = true
}

const goGithub = () => {
    window.open('https://github.com/ddries/atenead', "_blank")
};

const maximize = () => {
    bridge.maximize()
};

const minimize = () => {
    bridge.minimize()
};

const close =  () => {
    bridge.close()
};

</script>
