const search = document.getElementById('search');
const files_list = document.getElementById('file-list');

const content = document.getElementById("content")
const loading_circ = document.getElementById("circle")

let prevInfo = null;
let prevArrow = null;
let isAnimating = false;
let isInAction = false;

function filterItems() {
    const searchInput = search.value.toLowerCase();
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchInput) ? '' : 'none';
    });
}

function handleItemClick(key) {
    if (isAnimating) return;
    
    const currInfo = document.getElementById(`info-${key}`);
    const currArrow = document.getElementById(`arrow-${key}`);
    isAnimating = true

    if (prevInfo != null) {
        prevInfo.classList.remove("open");
        prevArrow.classList.toggle("rotate")

        prevInfo.addEventListener("transitionend", () => {
            if (prevInfo != currInfo) {
                currInfo.classList.add("open");
                currArrow.classList.toggle("rotate")
                prevInfo = currInfo;
                prevArrow = currArrow;
            } else {
                prevInfo = null;
                prevArrow = null;
            }
        }, {once: true});
    } else {
        currInfo.classList.add("open");
        currArrow.classList.toggle("rotate")
        prevInfo = currInfo;
        prevArrow = currArrow;
    }

    currInfo.addEventListener("transitionend", () => {
        isAnimating = false;
        //console.log(currInfo.scrollHeight);
    });
}

async function handleDownload(mtd_id, filename) {
    if (isInAction) return;
    isInAction = true;

    loading_circ.style.display = "flex";
    content.style.filter = "blur(5px)";
    files_list.style.overflowY = "hidden";

    try {
        const response = await fetch("/files", {
            method: "POST",
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({action: "download", mtd_id: mtd_id, filename: filename})
        });

        if (!response.ok || response.error) {
            alert("Error downloading file. Please try again.")
            isInAction = false;
            loading_circ.style.display = "none";
            content.style.filter = "none";
            files_list.style.overflowY = "scroll";
            return;
        }
        loading_circ.style.display = "none";
        content.style.filter = "none";
        files_list.style.overflowY = "scroll";

        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(downloadUrl);
        isInAction = false;

    } catch (e) {
        console.log(e);
        loading_circ.style.display = "flex";
        content.style.filter = "none";
        files_list.style.overflowY = "scroll";
        alert("Error downloading file. Please try again.");
        isInAction = false;
    }
}

async function handleFileDelete(mtd_id, key) {
    if (isInAction) return;

    let d_response = confirm("Are you sure you want to delete this file?");
    if (!d_response) return;

    isInAction = true;

    loading_circ.style.display = "flex";
    content.style.filter = "blur(5px)";
    files_list.style.overflowY = "hidden";

    try {
        const response = await fetch("/files", {
            method: "POST",
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({action: "delete", mtd_id: mtd_id, key: key})
        });

        if (!response.ok || response.error) {
            alert("Error deleting file. Please try again.")
            isInAction = false;
            loading_circ.style.display = "none";
            content.style.filter = "none";
            files_list.style.overflowY = "scroll";
            return;
        }

        const result = await response.json();
        if (response.ok) {
            alert("File deleted successfully!")
            isInAction = false;
            window.location.reload();
        }

    } catch (e) {
        console.log(e);
        loading_circ.style.display = "none";
        content.style.filter = "none";
        files_list.style.overflowY = "scroll";
        alert("Error deleting file. Please try again.");
        isInAction = false;
    }
}