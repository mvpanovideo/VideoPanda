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
                console.log(video.tagName)
                for (const source in video.target.children) {
                    const videoSource = video.target.children[source];
                    if (
                        typeof videoSource.tagName === "string" &&
                        videoSource.tagName === "SOURCE"
                    ) {
                        if (video.isIntersecting) {
                            if (!videoSource.src) {
                                videoSource.src = videoSource.dataset.src;
                                video.target.load();
                            } else {
                                video.target.play();
                            }
                        }
                    }
                }
            });
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
            elem.append(openVrElem);

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

    const text = isWx()
        ? "Open in browser for better experience"
        : "Click any video to open VR preview";
    const toastElem = document.createElement("div");
    toastElem.id = "toast";
    document.body.append(toastElem);
    toastElem.innerHTML = text;

    toastElem.classList.add("showToast");
    // setTimeout(() => {
    //     toastElem.classList.remove("showToast");
    //     toastElem.classList.add("hideToast");
    //     toastElem.addEventListener("animationend", () => {
    //         toastElem.remove();
    //     });
    // }, 4000);
});
