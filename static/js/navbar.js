const sidebar = document.querySelector(".sidebar")
const profile_nouser = document.querySelector(".profile-nouser")
const profile_withuser = document.querySelector(".profile-withuser")
const arrow = document.getElementById("arrow")

const profile_nouser_m = document.querySelector(".profile-nouser-m")
const profile_withuser_m = document.querySelector(".profile-withuser-m")
const arrow_m = document.getElementById("arrow-m")

const to_hide = document.getElementById("to-hide")

let profileOpen = false;

function showSidebar() {
    sidebar.style.display = "flex"
}

function hideSidebar() {
    sidebar.style.display = "none"
}

function toggleProfile(user_email, target) {

    if (target == "d") {
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
    } else if (target == "m") {
        let active;
        if (user_email) {
            active = profile_withuser_m
            to_hide.style.display = "none"
        } else {
            active = profile_nouser_m
            to_hide.style.display = "block"
        }

        if (!profileOpen) {
            profileOpen = true;
            active.style.display = "flex";
            arrow_m.style.transform = "rotate(180deg)";
        } else {
            profileOpen = false;
            active.style.display = "none";
            arrow_m.style.transform = "rotate(0deg)";
        }
    }
}