const login = document.getElementById("login")
const signup = document.getElementById("signup")

if (login) {
    login.addEventListener("submit", async (event) => {
        event.preventDefault()
    
        const form = event.target
        const formData = new FormData(form)
    
        try {
            const response = await fetch("/login", {
                method: "POST",
                body: formData
            });
    
            const result = await response.json()
    
            if (response.ok) {
                window.location.href = "/upload"
            } else {
                alert(result.error)
            }
        } catch (e) {
            console.log(e);
            alert("An unexpected error occured. Please try again.")
        }
    })
}

if (signup) {
    signup.addEventListener("submit", async (event) => {
        event.preventDefault()
    
        const form = event.target
        const formData = new FormData(form)
    
        try {
            const response = await fetch("/signup", {
                method: "POST",
                body: formData
            });

            const result = await response.json()
    
            if (response.ok) {
                window.location.href = "/upload"
            } else {
                alert(result.error)
            }
        } catch (e) {
            console.log(e);
            alert("An unexpected error occured. Please try again.")
        }
    })
}

