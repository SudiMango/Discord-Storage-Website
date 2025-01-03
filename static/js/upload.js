const dropArea = document.getElementById("drop-area")
const label = document.getElementById("drop-lbl")
const fileInput = document.getElementById("file-input")
const uploadBtn = document.getElementById("upload-btn")

const stats = document.getElementById("stats")
const currFile = document.getElementById("curr-file")
const uploaded = document.getElementById("uploaded")
const failed = document.getElementById("failed")

let filesToUpload = [];
let isUploading = false

dropArea.addEventListener("dragover", (event) => {
    if (isUploading) return;
    event.preventDefault();
});

dropArea.addEventListener("drop", (event) => {
    if (isUploading) return;
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
});

dropArea.addEventListener("click", (event) => {
    if (isUploading) return;
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    if (isUploading) return;
    const files = event.target.files;
    handleFiles(files);
});

function handleFiles(files) {
    const fileNames = [];
    filesToUpload = [];

    for (const f of files) {
        fileNames.push(f.name);
        filesToUpload.push(f);
    }

    label.textContent = fileNames.join(", ") || "Select or drag files here.";
}

uploadBtn.addEventListener("click", async () => {
    if (isUploading) return;
    isUploading = true;

    const numFiles = filesToUpload.length;

    if (numFiles == 0) {
        alert("Please input files to upload!");
        return;
    }

    let filesUploaded = 0
    let failedUploads = [];
    stats.style.display = "flex";

    let i = 0
    for (const f of filesToUpload) {
        const formData = new FormData();
        formData.append("files", f);
        currFile.textContent = `Currently uploading: ${f.name}`;

        try {
            const response = await fetch("/upload", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                filesUploaded += 1;
            } else {
                failedUploads.push(f.name);
            }
        } catch (e) {
            console.log(e);
            failedUploads.push(f.name);
        }

        uploaded.textContent = `Files uploaded: ${filesUploaded}`;
        failed.textContent = `Failed uploads: ${failedUploads.join(", ") || "none"}`;

        if ((i + 1) == numFiles) {
            filesToUpload = [];
            currFile.textContent = "Currently uploading: none";
            label.textContent = "Select or drag files here."
            fileInput.value = '';
            isUploading = false;
            requestAnimationFrame(() => {
                setTimeout(() => {
                    alert("Files finished uploading.");
                }, 0);
            });
        }

        i += 1;
    }
});