// Page navigation
const videosPerPage = 20;
const videos = document.querySelectorAll('.generation');
const paginationTop = document.getElementById('pagination-top');
const paginationBottom = document.getElementById('pagination-bottom');

// Get buttons and dropdowns for both top and bottom pagination
const topPrevBtn = paginationTop.querySelector('.prev-btn');
const topNextBtn = paginationTop.querySelector('.next-btn');
const topPageSelect = paginationTop.querySelector('.page-select');

const bottomPrevBtn = paginationBottom.querySelector('.prev-btn');
const bottomNextBtn = paginationBottom.querySelector('.next-btn');
const bottomPageSelect = paginationBottom.querySelector('.page-select');

// Synchronize buttons and dropdowns
function updatePaginationControls(currentPage) {
    const totalPages = Math.ceil(videos.length / videosPerPage);

    // Update button states
    [topPrevBtn, bottomPrevBtn].forEach(btn => btn.disabled = currentPage === 1);
    [topNextBtn, bottomNextBtn].forEach(btn => btn.disabled = currentPage === totalPages);

    // Update dropdowns
    [topPageSelect, bottomPageSelect].forEach(select => {
        select.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Page ${i}`;
            if (i === currentPage) option.selected = true;
            select.appendChild(option);
        }
    });
}

// Show the appropriate page
function showPage(page) {
    const start = (page - 1) * videosPerPage;
    const end = start + videosPerPage;

    // Show/Hide videos
    videos.forEach((video, index) => {
        video.style.display = index >= start && index < end ? 'block' : 'none';
    });

    // Update controls
    updatePaginationControls(page);
}

// Attach event listeners
function addPaginationListeners() {
    [topPrevBtn, bottomPrevBtn].forEach(btn => btn.addEventListener('click', () => {
        const currentPage = parseInt(topPageSelect.value, 10);
        showPage(currentPage - 1);
    }));

    [topNextBtn, bottomNextBtn].forEach(btn => btn.addEventListener('click', () => {
        const currentPage = parseInt(topPageSelect.value, 10);
        showPage(currentPage + 1);
    }));

    [topPageSelect, bottomPageSelect].forEach(select => select.addEventListener('change', (e) => {
        const selectedPage = parseInt(e.target.value, 10);
        showPage(selectedPage);
    }));
}
// Initialize
addPaginationListeners();
showPage(1);


// Lazy loading videos
const MAX_LOADED_VIDEOS = 20; // Adjust as needed
let loadedVideos = new Set(); // To track loaded videos
// Helper function to unload a video
function unloadVideo(video) {
    video.pause();
    for (const source of video.children) {
        if (source.tagName === "SOURCE") {
            source.removeAttribute("src");
            //source.src = ""; // Clear the source
        }
    }
    video.load(); // Reset video
    console.log(`Unloaded video: ${video}`);
}

document.addEventListener("DOMContentLoaded", function () {
    /** First we get all the non-loaded image elements **/
    var lazyImages = [].slice.call(document.querySelectorAll(".lazy-loaded-image.lazy"));
    /** Then we set up a intersection observer watching over those images and whenever any of those becomes visible on the view then replace the placeholder image with actual one, remove the non-loaded class and then unobserve for that element **/
    let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                let lazyImage = entry.target;
                lazyImage.src = lazyImage.dataset.src;
                lazyImage.classList.remove("lazy");
                lazyImageObserver.unobserve(lazyImage);
            }
        });},
        {
            threshold: 0.2, // load at 20% visibility
        }
    );
    /** Now observe all the non-loaded images using the observer we have setup above **/
    lazyImages.forEach(function(lazyImage) {
        lazyImageObserver.observe(lazyImage);
    });


    // Lazy load the videos
    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (video) {
                console.log(video.target.tagName)
                for (const source in video.target.children) {
                    const videoSource = video.target.children[source];
                    if (
                        typeof videoSource.tagName === "string" &&
                        videoSource.tagName === "SOURCE"
                    ) {
                        if (video.isIntersecting) {
                            console.log(videoSource.src)
                            if (!videoSource.src) {
                                videoSource.src = videoSource.dataset.src;
                                console.log(videoSource.src, videoSource.dataset.src)
                                video.target.load();
                                loadedVideos.add(video.target); // Track loaded video
                            } else {
                                video.target.play();
                            }
                        }
                    }
                }
            });

            // Unload videos if exceeding the limit
            while (loadedVideos.size > MAX_LOADED_VIDEOS) {
                const videoToUnload = loadedVideos.values().next().value; // Get the first loaded video
                unloadVideo(videoToUnload);
                loadedVideos.delete(videoToUnload); // Remove from loaded set
            }
        },
        {
            threshold: 0.2, // load at 20% visibility
        }
    );


    for (const elem of document.querySelectorAll(".lazyvideo")) {
        try {
            observer.observe(elem.children[0]);
        }
        catch (e) {
            console.error(e);
        }
    }

    function openVr(src) {
        is_video = src.endsWith(".mp4") //otherwise assume img
        const vrRoot = document.createElement("div");
        vrRoot.id = "vr-root";
        document.body.append(vrRoot);

        vrRoot.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
        });

        const scrollTop = window.scrollY;
        document.body.dataset.scrollTop = scrollTop.toString();
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollTop}px`;
        document.body.style.bottom = "0";
        document.body.style.overflow = "hidden";

        const aSceneRoot = document.createElement("div");
        aSceneRoot.classList.add("vr-container");
        if(is_video){
            aSceneRoot.innerHTML = `
    <a-scene vr-mode-ui="enabled: false" embedded>
        <a-assets>
            <video id="vr-video" loop playsinline muted autoplay src="${src}"></video>
        </a-assets>
        <a-videosphere src="#vr-video" rotation="0 180 0" radius="100"></a-videosphere>

        <a-entity camera="fov: 100" look-controls position="0 1.6 0">
    </a-entity>

    </a-entity>
    </a-scene>`;
        }
        else{
            aSceneRoot.innerHTML = `
    <a-scene vr-mode-ui="enabled: false" embedded>
        <a-sky src="${src}" rotation="0 180 0"></a-sky>
        <a-entity camera="fov: 100" look-controls position="0 1.6 0">
    </a-entity>
    </a-entity>
    </a-scene>`;
        }
    // <a-entity camera fov="120" look-controls="pointerLockEnabled: true" position="0 1.6 0"></a-entity>

    // <a-entity camera="active: true" fov="110" position="0 1.6 0" rotation="0 180 0" look-controls></a-entity>
        vrRoot.append(aSceneRoot);
        if(is_video){
            document.getElementById("vr-video").play();
        }

        const closeBtn = document.createElement("div");
        closeBtn.ariaLabel = "close-vr";
        closeBtn.classList.add("close-btn");
        closeBtn.innerHTML = `
<svg t="1707812514995" class="icon" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4211" width="40" height="40">
    <path d="M513.344 0a512 512 0 1 0 0 1024 512 512 0 0 0 0-1024z m226.048 674.624l-54.528 56.896-171.52-164.928-171.392 164.928-54.592-56.896L456.576 512 287.36 349.312l54.592-56.768 171.392 164.8 171.52-164.8 54.528 56.768L570.176 512l169.216 162.624z" fill="#ffffff" p-id="4212"></path>
</svg>`;
        closeBtn.addEventListener("click", closeVr);
        vrRoot.append(closeBtn);
    }

    function closeVr() {
        const scrollTop = document.body.dataset.scrollTop;
        document.body.style.position = "unset";
        document.body.style.top = `-${scrollTop}px`;
        document.body.style.bottom = "0";
        document.body.style.overflow = "unset";
        document.documentElement.scrollTo(0, scrollTop);

        const vrRoot = document.getElementById("vr-root");
        vrRoot.remove();
    }

    function isWx() {
        const ua = navigator.userAgent;
        return ua.indexOf("MicroMessenger") !== -1;
    }

    for (const elem of document.querySelectorAll(".video")) {
        try {
            observer.observe(elem.children[0]);

            const openVrElem = document.createElement("div");
            openVrElem.ariaLabel = "open-vr";
            openVrElem.innerHTML += "Click here to open in VR viewer"
            openVrElem.classList.add("open-vr");
            elem.parentElement.append(openVrElem);

            const ua = navigator.userAgent;
            if (isWx()) continue;
            
            console.log(elem.children[0].nodeName)
            const sourceElem = (elem.children[0].nodeName == "IMG") ? elem.children[0] : elem.children[0].children[0];
            const src = sourceElem.dataset.vrsrc;
            // const src = sourceElem.dataset.vrsrc || sourceElem.dataset.src;

            openVrElem.addEventListener("click", () => {
                openVr(src);
            });
        } catch (e) {
            console.error(e);
        }
    }

    // const text = isWx()
    //     ? "Open in browser for better experience"
    //     : "Click any video to open VR preview";
    // const toastElem = document.createElement("div");
    // toastElem.id = "toast";
    // document.body.append(toastElem);
    // toastElem.innerHTML = text;

    // toastElem.classList.add("showToast");
    // setTimeout(() => {
    //     toastElem.classList.remove("showToast");
    //     toastElem.classList.add("hideToast");
    //     toastElem.addEventListener("animationend", () => {
    //         toastElem.remove();
    //     });
    // }, 4000);
});


var session_id = "";

function applyOrdering(ordering) {{
    const elements = Array.from(document.getElementsByClassName("generation"));
    const container = elements[0].parentElement;
    elements.forEach((el) => container.removeChild(el));
    ordering.order.forEach((idx, new_idx) => {{
        elements[idx].dataset.idx = new_idx;
        container.appendChild(elements[idx]);
    }});
    ordering.option_order.forEach((swap, idx) => {{
        const videos = elements[idx].getElementsByClassName("video-tile");
        const container = videos[0].parentElement;
        if (swap) {{
            container.appendChild(videos[0]);
        }}
        Array.prototype.forEach.call(container.getElementsByTagName("button"), (el, idx) => {{
            el.innerText += " " + (idx + 1);
        }});
    }});
}}

function applySelections() {{
    const elements = document.getElementsByClassName("generation");
    Array.prototype.forEach.call(elements, (el) => {{
        const idx = el.dataset.idx;
        const selection = sessionStorage.getItem("selection-"+idx);
        if (selection != null) {{
            setSelected(el.getElementsByTagName("button")[selection]);
        }}
    }});
}}

function initializeSession() {{
    // session_id = sessionStorage.getItem("session_id");
    // if (session_id === null) {{
    //     session_id = crypto.randomUUID();
    //     sessionStorage.setItem("session_id", session_id);
    // }}

    // var ordering = sessionStorage.getItem("ordering");
    // if (ordering === null) {{
    //     const elements = document.getElementsByClassName("generation");
    //     const numbers = Array.prototype.map.call(elements, () => Math.random());
    //     const order = Array.from(numbers.keys()).sort((a, b) => numbers[a] - numbers[b]);
    //     const option_order = numbers.map(() => Math.random() > 0.5);
    //     ordering = {{order: order, option_order: option_order}};
    //     sessionStorage.setItem("ordering", JSON.stringify(ordering));
    // }} else {{
    //     ordering = JSON.parse(ordering);
    // }}

    // applyOrdering(ordering);
    // applySelections();
}}

function setSelected(btn) {{
    const container = btn.parentElement.parentElement.parentElement.parentElement;
    const buttons = container.getElementsByTagName("button");
    const choice = (buttons[0] == btn) ? 0 : 1;
    const selected = buttons[choice];
    const other = buttons[(choice + 1) % 2];
    other.hidden = true;
    selected.innerText = "Selected";
    selected.style.backgroundColor = "green";
    selected.disabled = true;
    sessionStorage.setItem("selection-" + container.dataset.idx, choice);
}}

function voteVideoInner(video, text, cnt) {{
    if (cnt > 5) {{
        console.log("Failed to vote!");
        return;
    }}

    const req = new XMLHttpRequest();
    req.addEventListener("error", (evt) => {{
        voteVideoInner(video, text, cnt + 1);
    }});
    req.open("POST", "");
    req.setRequestHeader("Content-Type", "text/plain");
    req.send(session_id + "|" + video + "|" + text);
}}

// Function to send the vote to the server.
function voteVideo(video, text) {{
    voteVideoInner(video, text, 0);
    setSelected(this);
}}