const sidebar = document.querySelector(".sidebar")
const profile_nouser = document.querySelector(".profile-nouser")
const profile_withuser = document.querySelector(".profile-withuser")
const arrow = document.getElementById("arrow")

let profileOpen = false;

function showSidebar() {
    sidebar.style.display = "flex"
}

function hideSidebar() {
    sidebar.style.display = "none"
}

function toggleProfile(user_email) {
    let active;
    if (user_email) {
        active = profile_withuser
    } else {
        active = profile_nouser
    }

    if (!profileOpen) {
        profileOpen = true;
        active.style.display = "flex";
        arrow.style.transform = "rotate(180deg)";
    } else {
        profileOpen = false;
        active.style.display = "none";
        arrow.style.transform = "rotate(0deg)";
    }
}