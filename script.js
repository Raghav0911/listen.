// Listen. website - basic JavaScript interactions
document.addEventListener("DOMContentLoaded", function () {
    // Search songs on the Library page
    const searchInput = document.getElementById("songSearch");
    if (searchInput) {
        const songs = document.querySelectorAll(".song-card");
        const searchMessage = document.getElementById("searchMessage");
        searchInput.addEventListener("input", function () {
            const searchText = searchInput.value.toLowerCase().trim();
            let visibleSongs = 0;
            songs.forEach(function (song) {
                const match = song.textContent.toLowerCase().includes(searchText);
                song.style.display = match ? "grid" : "none";
                if (match) visibleSongs++;
            });
            searchMessage.textContent = visibleSongs === 0 ? "No songs found. Try another search." : visibleSongs + " song(s) found.";
        });
    }

    // Live character counter
    document.querySelectorAll("[data-char-count]").forEach(function (field) {
        field.addEventListener("input", function () {
            const countId = field.id === "feedbackMessage" ? "feedbackCount" : "requestCount";
            const counter = document.getElementById(countId);
            if (counter) counter.textContent = field.value.length + " / " + field.maxLength + " characters";
        });
    });

    // Validate and submit forms to the local server
    document.querySelectorAll("[data-json-form]").forEach(function (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const status = form.querySelector(".form-message");
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const submission = {
                type: form.dataset.formType,
                submittedAt: new Date().toISOString(),
                ...Object.fromEntries(new FormData(form).entries())
            };
            status.classList.remove("error");
            status.textContent = "Submitting...";
            try {
                const response = await fetch("/submit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(submission)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || "Submission failed.");
                status.textContent = "Thank you! Your form has been submitted successfully.";
                form.reset();
                const counter = form.querySelector(".char-count");
                if (counter) counter.textContent = "0 / " + form.querySelector("[data-char-count]").maxLength + " characters";
            } catch (error) {
                status.classList.add("error");
                status.textContent = "Could not submit. Please run the website using: node server.js";
            }
        });
    });

    // Demo login validation (no real accounts or passwords are stored)
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const message = document.getElementById("loginMessage");
            if (!email || password.length < 6) {
                message.classList.add("error");
                message.textContent = "Please enter a valid email and a password of at least 6 characters.";
            } else {
                message.classList.remove("error");
                message.textContent = "Demo login successful! This project does not use real accounts.";
            }
        });
    }
});