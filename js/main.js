const fileInput = document.getElementById("fileInput");
const dropArea = document.getElementById("dropArea");
const fileList = document.getElementById("fileList");
const themeBtn = document.getElementById("themeBtn");
const mergeBtn = document.getElementById("mergeBtn");

let filesArray = [];

// Night mode default
document.body.classList.remove("light");
themeBtn.textContent = "☀ Day Mode";

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    themeBtn.textContent = document.body.classList.contains("light") ? "🌙 Night Mode" : "☀ Day Mode";
});

// Add files from file input
fileInput.addEventListener("change", (e) => {
    addFiles(Array.from(e.target.files));
});

// Add files helper (avoid duplicates by name+size)
function addFiles(newFiles) {
    for (const f of newFiles) {
        if (!filesArray.some(existing => existing.name === f.name && existing.size === f.size)) {
            filesArray.push(f);
        }
    }
    renderFileList();
}

// Drag & drop file upload handlers
dropArea.addEventListener("dragenter", (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
});
dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
});
dropArea.addEventListener("dragleave", (e) => {
    e.preventDefault();
    // Only remove if leaving the dropArea entirely
    if (!dropArea.contains(e.relatedTarget)) {
        dropArea.classList.remove("dragover");
    }
});
dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(Array.from(e.dataTransfer.files));
        e.dataTransfer.clearData();
    }
});

function renderFileList() {
    fileList.innerHTML = "";

    if (!filesArray.length) {
        const hint = document.createElement("li");
        hint.className = "hint";
        hint.textContent = 'No files chosen — drag & drop files here or click "Choose Files".';
        fileList.appendChild(hint);
        return;
    }

    filesArray.forEach((file) => {
        const li = document.createElement("li");
        li.draggable = true;
        li._file = file;

        const nameSpan = document.createElement("span");
        nameSpan.className = "filename";
        nameSpan.textContent = file.name;

        const sizeSpan = document.createElement("span");
        sizeSpan.className = "size";
        sizeSpan.textContent = formatBytes(file.size);

        li.appendChild(nameSpan);
        li.appendChild(sizeSpan);

        fileList.appendChild(li);
    });

    addDragAndDrop();
}

// Drag and drop reordering inside the file list
function addDragAndDrop() {
    let dragged = null;

    fileList.addEventListener("dragstart", (e) => {
        const li = e.target.closest("li");
        if (!li) return;
        dragged = li;
        li.classList.add("dragging");
    });

    fileList.addEventListener("dragend", (e) => {
        if (dragged) dragged.classList.remove("dragging");
        dragged = null;
    });

    fileList.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (!dragged) return;
        const target = e.target.closest("li");
        if (!target || target === dragged) return;

        const rect = target.getBoundingClientRect();
        const after = (e.clientY - rect.top) > rect.height / 2;

        if (after) {
            target.after(dragged);
        } else {
            target.before(dragged);
        }
    });

    fileList.addEventListener("drop", (e) => {
        e.preventDefault();
        updateFileOrder();
    });
}

function updateFileOrder() {
    const newOrder = [];
    fileList.querySelectorAll("li").forEach(li => {
        if (li._file) newOrder.push(li._file);
    });
    filesArray = newOrder;
}

mergeBtn.addEventListener("click", async () => {
    if (!filesArray.length) {
        alert("Please upload text files first.");
        return;
    }
    let mergedText = "";
    for (const file of filesArray) {
        const text = await file.text();
        mergedText += text + "\n";
    }

    const blob = new Blob([mergedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.txt";
    a.click();
    URL.revokeObjectURL(url);
});

function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
                         }
