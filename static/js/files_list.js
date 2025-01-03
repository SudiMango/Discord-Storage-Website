const search = document.getElementById('search');

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

    try {
        const response = await fetch("/files", {
            method: "POST",
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({action: "download", mtd_id: mtd_id, filename: filename})
        });

        if (!response.ok || response.error) {
            alert("Error downloading file. Please try again.")
            isInAction = false;
            return;
        }

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
        alert("Error downloading file. Please try again.");
        isInAction = false;
    }
}

async function handleFileDelete(mtd_id, key) {
    if (isInAction) return;

    let d_response = confirm("Are you sure you want to delete this file?");
    if (!d_response) return;

    isInAction = true;

    try {
        const response = await fetch("/files", {
            method: "POST",
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({action: "delete", mtd_id: mtd_id, key: key})
        });

        if (!response.ok || response.error) {
            alert("Error deleting file. Please try again.")
            isInAction = false;
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
        alert("Error deleting file. Please try again.");
        isInAction = false;
    }
}

/*
function handleItemClick(itemName) {
    window.location.href = `/files/${itemName}`;
}

async function handleDownload(mtd_id, filename) {
    try {
        const response = await fetch("/files", {
            method: "POST",
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({action: "download", mtd_id: mtd_id, filename: filename})
        });
    } catch (e) {
        console.log(e);
        alert("Error downloading file. Please try again.")
    }
}

async function handleFileDelete(key) {
    let d_response = confirm("Are you sure you want to delete this file?");
    if (d_response) {
        try {
            const response = await fetch("/files", {
                method: "POST",
                headers: {'content-type': 'application/json'},
                body: JSON.stringify({action: "delete", key: key})
            });
        } catch (e) {
            console.log(e);
            alert("Error deleting file. Please try again.")
        }
    }
}

function handleDownload(mtd_id, filename) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/files";
    form.style.display = "none";

    const actionInput = document.createElement('input');
    actionInput.type = 'hidden';
    actionInput.name = 'action';
    actionInput.value = 'download';
    form.appendChild(actionInput);

    const mtd_id_input = document.createElement('input');
    mtd_id_input.type = 'hidden';
    mtd_id_input.name = 'mtd_id';
    mtd_id_input.value = mtd_id;
    form.appendChild(mtd_id_input);

    const filename_input = document.createElement('input');
    filename_input.type = 'hidden';
    filename_input.name = 'filename';
    filename_input.value = filename;
    form.appendChild(filename_input);

    document.body.appendChild(form);
    form.submit();
    form.remove();
}

function handleDownload(mtd_id, filename) {
    if (isInAction) return;
    isInAction = true;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/files";

    const actionInput = document.createElement('input');
    actionInput.type = 'hidden';
    actionInput.name = 'action';
    actionInput.value = 'download';
    form.appendChild(actionInput);

    const mtd_id_input = document.createElement('input');
    mtd_id_input.type = 'hidden';
    mtd_id_input.name = 'mtd_id';
    mtd_id_input.value = mtd_id;
    form.appendChild(mtd_id_input);

    const filename_input = document.createElement('input');
    filename_input.type = 'hidden';
    filename_input.name = 'filename';
    filename_input.value = filename;
    form.appendChild(filename_input);

    const iframe = document.createElement('iframe');
    iframe.name = 'download_iframe';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    form.target = 'download_iframe';
    form.style.display = 'none';
    document.body.appendChild(form);

    iframe.addEventListener('load', function() {
        try {
            const iframeContent = iframe.contentWindow.document.body.textContent;
            const response = JSON.parse(iframeContent);
            if (response.error) {
                alert(response.error);
            }
        } catch (e) {
            // Recieved file to download
        } finally {
            isInAction = false;
            console.log("can action");
            form.remove();
            iframe.remove();
        }
    });

    form.submit();
}

function handleFileDelete(key) {
    if (isInAction) return;
    isInAction = true;

    let d_response = confirm("Are you sure you want to delete this file?");
    if (!d_response) return;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/files";

    const actionInput = document.createElement('input');
    actionInput.type = 'hidden';
    actionInput.name = 'action';
    actionInput.value = 'delete';
    form.appendChild(actionInput);

    const key_input = document.createElement('input');
    key_input.type = 'hidden';
    key_input.name = 'key';
    key_input.value = key;
    form.appendChild(key_input);

    const iframe = document.createElement('iframe');
    iframe.name = 'download_iframe';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    form.target = 'download_iframe';
    form.style.display = 'none';
    document.body.appendChild(form);

    iframe.addEventListener('load', function() {
        try {
            const iframeContent = iframe.contentWindow.document.body.textContent;
            const response = JSON.parse(iframeContent);
            console.log(response);
            if (response.error) {
                alert(response.error);
            } else if (response.success) {
                window.location.reload();
            }
        } catch (e) {
            
        } finally {
            isInAction = false;
            console.log("can action");
            form.remove();
            iframe.remove();
        }
    });

    form.submit();
}
*/