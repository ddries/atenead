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
            <p class="text-sm absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">Atenead 1.0.0-abc1234</p>
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
                        <input v-model="username" class="bg-transparent border-2 border-gray-500 p-2 rounded-md transition duration-300 focus:outline-none focus:border-[#07b] focus:border-2" type="text" placeholder="Username or email" />
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

            <!--  My Courses page -->
            <Transition>
                <div class="flex flex-col w-full p-4 text-white/80" v-if="view == 1">
                    <div class="flex gap-3 items-center mt-0">
                        <img class="rounded-full w-10" :src="avatar" />
                        <span>{{ name }}</span>
                    </div>
                    
                    <div class="flex flex-col mt-4 gap-3 max-h-[70vh] overflow-y-auto">
                        <div v-for="c in courses" :key="c" class="rounded-md border p-3 border-[#6c757d] cursor-pointer"> <!-- bg-[#353a44] -->
                            <span>{{ c }}</span>
                        </div>
                    </div>

                    <!-- Footer -->
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

                    <!-- <div class="flex gap-1 mt-3 w-full h-[55vh]">
                        <div class="flex flex-col mt-5 gap-2 w-full">
                            <span class="font-roboto">All courses</span>
                            <div class="flex flex-col w-full border border-[#6c757d] rounded-md p-3 gap-3 overflow-y-auto">
                                <div v-for="c in courses" :key="c" class="rounded-md border p-1 hover:underline border-[#6c757d] cursor-pointer">
                                    <span>{{ c }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col mt-5 gap-2 w-full">
                            <span class="font-roboto self-end">Download list</span>
                            <div class="border border-[#6c757d] rounded-md p-3 overflow-y-auto">
                                <div v-if="coursesDownload.length > 0" class="gap-3 flex flex-col w-full ">
                                    <div v-for="c in coursesDownload" :key="c" class="rounded-md border p-1 hover:underline border-[#6c757d] cursor-pointer">
                                        <span>{{ c }}</span>
                                    </div>
                                </div>
                                <div v-else>
                                    <p class="text-center text-gray-300">Click on some courses!</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="absolute bottom-3 left-0 w-full flex items-center justify-around">
                        <span>Selected: 0 courses</span>
                        <div class="flex gap-2">
                            <button 
                                class="flex gap-1 p-2 items-center border border-white hover:bg-[#07b] hover:border-[#07b] transition rounded-md"
                                :class="[ coursesDownload.length <= 0 ? 'opacity-20 cursor-not-allowed hover:bg-transparent hover:border-white' : '' ]"
                            >
                                <svg class="fill-white w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>
                                <span>Download</span>
                            </button>
                        </div>
                    </div> -->
                </div>
            </Transition>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue"

/**
 * 0 = Login
 * 1 = My Courses
 */
const view = ref(0)
const showLoader = ref(false)

const username = ref("")
const password = ref("")

const name = ref("")
const avatar = ref("")

const onlyPdfs = ref(true)
const compressIntoZip = ref(false)

const courses = ref([
    // "INTERCONNEXIÓ DE XARXES (Curs Total)",
    // "INTERCONNEXIÓ DE XARXES (Curs Total)",
    // "INTERCONNEXIÓ DE XARXES (Curs Total)",
    // "INTERCONNEXIÓ DE XARXES (Curs Total)",
    // "INTERCONNEXIÓ DE XARXES (Curs Total)",
    // "INTERCONNEXIÓ DE XARXES (Curs Total)",
    // "INTERCONNEXIÓ DE XARXES (Curs Total)",
    // "INTERCONNEXIÓ DE XARXES (Curs Total)",
    // "INTERCONNEXIÓ DE XARXES (Curs Total)",
    // "INTERCONNEXIÓ DE XARXES (Curs Total)",
    // "INTERCONNEXIÓ DE XARXES (Curs Total)",
    // "INTERCONNEXIÓ DE XARXES (Curs Total)",
])

const coursesDownload = ref([

])

bridge.on('load', (coursesStr) => {
    const _courses = JSON.parse(coursesStr);
    for (const c of _courses) {
        courses.value.push(c.name)
    }

    view.value = 1
    showLoader.value = false
});

const loginRequest = () => {
    bridge.on('login-response', data => {
        data = JSON.parse(data);
        console.log(data);

        if (data) {
            name.value = data.name
            username.value = data.username
            avatar.value = data.avatarUrl
        }

        bridge.load()
        // showLoader.value = false
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
